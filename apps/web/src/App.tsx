import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useAccount, useConnect, useDisconnect, useSignTypedData, useWriteContract, useReadContract } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { sha256 } from 'js-sha256'
import './App.css'

// IMPORTANT: Replace this with the actual deployed contract address on Sepolia
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const

const abi = [
  {
    "type": "function",
    "name": "stampDocument",
    "inputs": [
      { "name": "documentHash", "type": "bytes32" },
      { "name": "signer", "type": "address" },
      { "name": "deadline", "type": "uint256" },
      { "name": "signature", "type": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "isStamped",
    "inputs": [{ "name": "documentHash", "type": "bytes32" }],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nonces",
    "inputs": [{ "name": "owner", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const

function App() {
  const { address, isConnected, chainId } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const [file, setFile] = useState<File | null>(null)
  const [docHash, setDocHash] = useState<string>('')
  const [statusMsg, setStatusMsg] = useState<string>('')

  const [checkHash, setCheckHash] = useState<string>('')
  
  // Read the current nonce for the connected user
  const { data: nonce, error: nonceError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'nonces',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  })
  if (nonceError) {
    console.error("Error reading nonce: ", nonceError)
  }

  // Hook to verify if a hash is stamped
  const { data: isStampedResult, refetch: checkIsStamped } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'isStamped',
    args: checkHash ? [checkHash as `0x${string}`] : undefined,
    query: {
      enabled: false, // Only run when user clicks "Verify"
    }
  })

  // Hook for EIP-712 typing
  const { signTypedDataAsync } = useSignTypedData()

  // Hook for writing to contract
  const { writeContractAsync } = useWriteContract()

  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    if (selectedFile.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    setFile(selectedFile)
    setStatusMsg('Hashing document...')

    // Read and hash the file locally
    const buffer = await selectedFile.arrayBuffer()
    const hashHex = sha256(buffer)
    const formattedHash = `0x${hashHex}`
    setDocHash(formattedHash)
    setStatusMsg('Document hashed successfully.')
  }

  // Handle stamping process (Sign + Tx)
  const handleStamp = async () => {
    if (!docHash || !address) {
      alert('Missing required data: Please connect wallet and upload a document.')
      return
    }

    const currentNonce = nonce ?? 0n

    try {
      setStatusMsg('Requesting signature...')
      
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600) // 1 hour from now

      // 1. Sign EIP-712 Typed Data
      const signature = await signTypedDataAsync({
        domain: {
          name: 'TridentZero',
          version: '1',
          chainId: chainId,
          verifyingContract: CONTRACT_ADDRESS,
        },
        types: {
          StampDocument: [
            { name: 'documentHash', type: 'bytes32' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'StampDocument',
        message: {
          documentHash: docHash as `0x${string}`,
          nonce: currentNonce as bigint,
          deadline: deadline,
        },
      })

      setStatusMsg('Signature received. Sending Transaction...')

      // 2. Send transaction to stamping contract
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'stampDocument',
        args: [docHash as `0x${string}`, address, deadline, signature],
      })

      setStatusMsg(`Transaction submitted! Tx Hash: ${txHash}`)

    } catch (err: any) {
      console.error(err)
      setStatusMsg(`Error: ${err.shortMessage || err.message}`)
    }
  }

  const handleVerify = () => {
    if (!checkHash) {
      alert("Please enter a document hash to verify.")
      return
    }
    checkIsStamped()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">TridentZero PoC</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">Web3 Document Stamping</p>

        {/* --- Phase 1: Wallet Connect --- */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">1. Wallet Connection</h2>
          {isConnected ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-green-600 font-medium">✅ Connected</p>
              <p className="text-xs text-gray-500 font-mono break-all">{address}</p>
              <button 
                onClick={() => disconnect()}
                className="mt-2 px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 hover:bg-red-100 transition-colors self-start"
              >
                Disconnect
              </button>
            </div>
          ) : (
             <button 
              onClick={() => connect({ connector: injected() })}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Connect MetaMask
            </button>
          )}
        </div>

        {/* --- Phase 2: File Upload & Hash --- */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">2. Document Selection</h2>
          <input 
            type="file" 
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          {file && (
            <div className="mt-4 p-3 bg-white border border-gray-200 rounded-md">
              <p className="text-xs text-gray-500 mb-1">File: <span className="text-gray-800 font-medium">{file.name}</span></p>
              <p className="text-xs text-gray-500">Hash:</p>
              <p className="text-xs bg-gray-100 p-2 rounded text-gray-600 font-mono break-all break-words">{docHash}</p>
            </div>
          )}
        </div>

        {/* --- Phase 3: Stamping --- */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">3. Stamp Document</h2>
          
          <button 
            onClick={handleStamp}
            disabled={!isConnected || !docHash}
            className="w-full py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Sign & Stamp Document
          </button>

          {statusMsg && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-md">
              <p className="text-sm text-indigo-800 break-words">{statusMsg}</p>
            </div>
          )}
        </div>

        {/* --- Phase 4: Verification --- */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">4. Verify Document</h2>
          <p className="text-xs text-gray-500 mb-2">Check if a document hash exists on the TridentRegistry smart contract.</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="0x..." 
              value={checkHash}
              onChange={(e) => setCheckHash(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-sm font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={handleVerify}
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Verify
            </button>
          </div>
          
          {isStampedResult !== undefined && (
            <div className={`mt-4 p-3 rounded-md border text-sm flex items-center gap-2 ${isStampedResult ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <span className="text-xl">{isStampedResult ? '✅' : '❌'}</span>
              <div>
                <p className="font-semibold">{isStampedResult ? 'Verified!' : 'Not Found'}</p>
                <p className="text-xs opacity-80">{isStampedResult ? 'This document hash has been stamped on-chain.' : 'This document hash has not been stamped yet.'}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default App
