# TridentZero

TridentZero adalah platform **Web3 Document Stamping** yang dirancang khusus untuk memastikan keaslian sebuah dokumen melalui pendekatan *off-chain hashing* dan *on-chain attestation* (Sepolia Testnet). 

Project ini adalah **Proof of Concept (PoC)** minimalis yang mendemonstrasikan end-to-end flow:
1. Connect Wallet (MetaMask)
2. Upload PDF
3. Kalkulasi local hashing atas file PDF tersebut (SHA-256)
4. Pengesahan hashing tersebut menggunakan Wallet (EIP-712 Typed Data)
5. Penyimpanan `DocumentStamped` attestation ke Smart Contract

<br>

---

## 🏗 Struktur Proyek

Repositori ini berkonsep *monorepo* sederhana:

```text
tridentzero/
├── apps/
│   └── web/                  # Frontend Vite (React/TypeScript + Tailwind + Wagmi)
├── contracts/                # Kontrak Solidity (Foundry)
└── docs/                     # Dokumentasi PRD / Arsitektur
```

Fitur pendukung back-end (relayer, renderer, indexer, dsb) ditiadakan untuk kemudahan demonstrasi murni Web3.

---

## 🚀 Instalasi & Jalankan Secara Lokal

Anda memerlukan **Node.js** (v18+) dan **Foundry** untuk menjalankan keseluruhan repo ini secara lokal.

### 1. Menjalankan Smart Contract (Lokal node - Anvil)

Buka terminal pertama:

```bash
# Nyalakan local node Anvil
anvil
```

Buka terminal kedua untuk compile dan deploy kontrak:

```bash
cd contracts/
forge install
forge build

# Deploy kontrak ke local Anvil
forge script script/DeployTridentRegistry.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
*(Private Key di atas adalah milik default account dummy #0 dari Anvil. Jangan transfer aset mainnet ke akun tersebut!)*

Catat contract address hasil deployment, dan *update* `CONTRACT_ADDRESS` di aplikasi web.

### 2. Menjalankan Web App (Frontend)

Buka terminal ketiga:

```bash
cd apps/web/
npm install
npm run dev
```

Aplikasi web dapat diakses di `http://localhost:5173`. 
Pastikan dompet MetaMask Anda terkoneksi ke Network Lokal (`http://127.0.0.1:8545` Chain ID `31337`).

---

## 🔐 Keamanan

Semua `private key` dan `.env` telah diblokir melalui `.gitignore`. Harap berhati-hati agar **tidak pernah melakukan komit Private Key Sepolia Anda ke repositori ini** secara sengaja.
