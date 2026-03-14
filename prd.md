# PRD — TridentZero
**Versi:** 1.0  
**Status:** Draft for Implementation  
**Project Name:** TridentZero  
**Environment Awal:** Local Dev + Sepolia Testnet  
**Dokumen Owner:** Product / Engineering / Smart Contract Team  
**Tanggal:** 2026-03-14

---

# 1. Ringkasan

**TridentZero** adalah platform **Web3 Document Stamping** yang memungkinkan user:

1. login dengan wallet,
2. upload dokumen PDF,
3. drag-and-drop tanda tangan/stamp visual ke dokumen,
4. menyetujui dokumen final dengan wallet signature,
5. meng-anchor bukti approval tersebut ke blockchain,
6. membagikan dokumen final beserta bukti verifikasinya.

Tujuan utamanya adalah membuat proses stamping dokumen yang:
- mudah dipakai user non-teknis,
- punya bukti kriptografis yang kuat,
- hemat gas,
- mudah diverifikasi oleh pihak ketiga,
- siap dikembangkan ke production network setelah validasi di Sepolia.

TridentZero **bukan** sistem yang menyimpan file ke blockchain.  
Blockchain hanya dipakai sebagai **proof/attestation layer**, sedangkan file dan metadata utama tetap dikelola off-chain.

---

# 2. Problem Statement

Masalah yang ingin diselesaikan oleh TridentZero:

## 2.1 Masalah user
- User ingin menandatangani/stamp dokumen secara digital dengan flow yang sederhana.
- Banyak solusi e-sign hanya menaruh gambar tanda tangan tanpa bukti kriptografis yang kuat.
- User ingin bukti bahwa dokumen tertentu memang disetujui oleh wallet tertentu.

## 2.2 Masalah teknis
- Menyimpan file di blockchain sangat mahal.
- Mengandalkan gambar tanda tangan saja tidak cukup.
- Verifikasi publik atas dokumen digital sering tidak konsisten.
- Sistem perlu mendukung wallet biasa (EOA) dan smart contract wallet.

## 2.3 Kenapa perlu solusi hybrid
Agar sistem usable dan efisien:
- **wallet** dipakai untuk approval,
- **backend** dipakai untuk rendering, storage, session, dan indexing,
- **blockchain** dipakai untuk bukti yang immutable,
- **IPFS** opsional dipakai untuk distribusi file final.

---

# 3. Visi Produk

Membangun platform stamping dokumen berbasis Web3 yang:
- sederhana untuk user,
- kuat secara kriptografis,
- efisien biaya,
- mudah diverifikasi,
- siap digunakan sebagai fondasi fitur dokumen enterprise di masa depan.

---

# 4. Goals

## 4.1 Product Goals
1. User dapat login menggunakan wallet.
2. User dapat mengunggah PDF.
3. User dapat menempatkan tanda tangan/stamp visual di PDF.
4. User dapat menandatangani approval final PDF menggunakan wallet.
5. Sistem dapat menyimpan bukti approval tersebut di Sepolia.
6. Dokumen final dapat diverifikasi secara publik.

## 4.2 Technical Goals
1. On-chain data harus minimal.
2. Gas fee harus rendah.
3. Sistem harus support EOA dan smart contract wallet.
4. Hash dokumen final harus menjadi pusat verifikasi.
5. Sistem harus punya audit trail yang jelas.

## 4.3 Business Goals
1. Membuktikan konsep produk di testnet.
2. Menjadi fondasi untuk enterprise document proofing.
3. Menyiapkan arsitektur yang dapat naik ke production L2 di masa depan.

---

# 5. Non-Goals

Untuk MVP, TridentZero **tidak mencakup**:

- native PDF certificate signing (PAdES / X.509),
- NFT certificate minting,
- multi-signer workflow,
- delegated legal signing workflow,
- on-chain document storage,
- decentralized storage-only architecture tanpa backend,
- payment system,
- DAO governance,
- multi-chain production deployment.

---

# 6. Product Principles

## 6.1 Login dipisah dari approval dokumen
- Login wallet dipakai untuk session aplikasi.
- Approval dokumen adalah aksi terpisah yang memerlukan signature berbeda.

## 6.2 Final PDF adalah objek utama
User harus menandatangani **hash exact bytes dari final PDF**, bukan file mentah, bukan draft placement, dan bukan hanya metadata.

## 6.3 Blockchain hanya untuk proof
Blockchain hanya menyimpan bukti minimum:
- signer,
- nonce,
- hash,
- event.

## 6.4 Visual signature hanya untuk UX
Gambar tanda tangan/stamp di PDF hanyalah elemen visual.  
Bukti sebenarnya adalah **wallet signature + on-chain attestation**.

## 6.5 Event-first, storage-light
Contract tidak berfungsi sebagai database dokumen.  
Contract hanya berfungsi sebagai **registry of attestations**.

## 6.6 Verifier harus percaya hash dan chain, bukan database
Database hanya cache/index.  
Source of truth adalah:
- final PDF bytes,
- hash final,
- event on-chain.

---

# 7. User Personas

## 7.1 End User / Signer
Kebutuhan:
- flow sederhana,
- tidak perlu paham blockchain terlalu dalam,
- hasil akhir mudah diunduh dan dibagikan.

## 7.2 Recipient / Verifier
Kebutuhan:
- dapat memverifikasi file dengan cepat,
- tahu siapa signer-nya,
- tahu apakah file cocok dengan bukti di chain.

## 7.3 Admin Internal
Kebutuhan:
- memonitor sistem,
- melihat status relay,
- bisa pause saat ada insiden,
- mengelola konfigurasi sistem.

## 7.4 Engineering / Ops
Kebutuhan:
- observability,
- retry-safe relay,
- hash integrity,
- predictable deployments,
- keamanan admin key dan relayer key.

---

# 8. User Stories

## 8.1 Authentication
- Sebagai user, saya ingin login dengan wallet tanpa password.
- Sebagai user, saya ingin session saya tetap aktif dalam batas waktu tertentu.
- Sebagai user, saya ingin logout dengan aman.

## 8.2 Document Flow
- Sebagai user, saya ingin upload PDF.
- Sebagai user, saya ingin melihat preview PDF.
- Sebagai user, saya ingin menaruh tanda tangan/stamp visual di halaman tertentu.
- Sebagai user, saya ingin memastikan preview final sesuai sebelum saya sign.

## 8.3 Approval & Stamping
- Sebagai user, saya ingin mengesahkan final PDF dengan wallet saya.
- Sebagai user, saya ingin mendapatkan final PDF dan bukti transaksinya.
- Sebagai user, saya ingin melihat status stamp saya: pending / success / failed.

## 8.4 Verification
- Sebagai verifier, saya ingin upload file final untuk dicek validitasnya.
- Sebagai verifier, saya ingin memasukkan stamp ID / verifier URL untuk melihat receipt.
- Sebagai verifier, saya ingin tahu apakah file ini benar-benar yang disetujui signer.

## 8.5 Administration
- Sebagai admin, saya ingin pause sistem bila ada insiden.
- Sebagai admin, saya ingin melihat log aktivitas penting.
- Sebagai admin, saya ingin memantau kegagalan relay.

---

# 9. High-Level User Flow

## 9.1 Main Flow
1. User connect wallet.
2. User login.
3. User upload PDF.
4. User drag-and-drop visual signature/stamp.
5. Backend render final PDF.
6. Backend hitung hash final.
7. User sign approval via wallet.
8. Relayer mengirim transaksi ke contract.
9. Contract emit event.
10. User menerima final PDF + receipt.
11. Verifier dapat memverifikasi final PDF.

## 9.2 Simple Product Flow
**Login → Upload PDF → Place Stamp → Preview Final PDF → Sign Approval → Relay On-Chain → Download Final PDF + Receipt**

---

# 10. Scope MVP

## 10.1 In Scope
- wallet login,
- PDF upload,
- PDF preview,
- drag-and-drop visual stamp,
- final PDF rendering,
- final hash generation,
- typed data approval signing,
- on-chain attestation on Sepolia,
- receipt page,
- verification page,
- admin pause mechanism,
- transaction status tracking.

## 10.2 Out of Scope
- multiple signers,
- shared signing workflow,
- recipient email flow,
- enterprise tenant isolation,
- legal certificate workflow,
- watermark templates advanced editor,
- reusable signature gallery multi-brand,
- payment and billing,
- chain abstraction.

---

# 11. Functional Requirements

## 11.1 Authentication

### FR-A1
System harus memungkinkan user login via wallet.

### FR-A2
System harus membuat nonce login yang unik.

### FR-A3
System harus memverifikasi signature login dan nonce.

### FR-A4
System harus membuat session yang di-bind ke wallet address.

### FR-A5
System harus mendukung logout dan session invalidation.

### FR-A6
Session harus punya expiration time.

---

## 11.2 Document Upload

### FR-D1
System hanya menerima PDF pada MVP.

### FR-D2
System harus memvalidasi ukuran file.

### FR-D3
System harus menolak file yang tidak valid atau corrupted.

### FR-D4
System harus menyimpan original document secara aman.

### FR-D5
System harus menghitung `originalHash` dari exact bytes file original.

---

## 11.3 Placement Editor

### FR-P1
User dapat memilih halaman untuk stamp.

### FR-P2
User dapat memindahkan posisi stamp.

### FR-P3
User dapat resize stamp.

### FR-P4
System harus menyimpan koordinat stamp dalam koordinat PDF/page space.

### FR-P5
System harus menghasilkan placement metadata yang deterministic.

---

## 11.4 Final PDF Rendering

### FR-R1
System harus merender final PDF sebelum approval wallet.

### FR-R2
Final PDF harus mencerminkan persis apa yang dilihat user pada preview final.

### FR-R3
System harus memasukkan visual signature/stamp ke final PDF.

### FR-R4
System boleh menambahkan verifier reference yang sudah diketahui sebelum signing.

### FR-R5
System tidak boleh mengubah bytes final PDF setelah user sign approval.

### FR-R6
System harus menghitung `finalHash` dari exact bytes final PDF.

### FR-R7
System harus menghitung `metadataHash` dari metadata terstruktur yang relevan.

---

## 11.5 Wallet Approval

### FR-S1
System harus meminta wallet signature terpisah untuk approval stamping.

### FR-S2
Payload approval harus berisi:
- signer,
- finalHash,
- originalHash,
- metadataHash,
- nonce,
- deadline.

### FR-S3
System harus menolak approval yang expired.

### FR-S4
System harus menolak replay approval.

### FR-S5
System harus menyimpan rekam approval beserta statusnya.

---

## 11.6 On-Chain Anchoring

### FR-C1
System harus mengirim satu transaksi stamping per approval pada MVP.

### FR-C2
Contract harus memverifikasi signature user.

### FR-C3
Contract harus menerima EOA dan smart contract wallet.

### FR-C4
Contract harus mengonsumsi nonce user.

### FR-C5
Contract harus mengeluarkan event attestation.

### FR-C6
Contract harus dapat dipause oleh admin.

---

## 11.7 Verification

### FR-V1
Verifier dapat melakukan verifikasi berdasarkan upload final PDF.

### FR-V2
Verifier dapat melakukan verifikasi berdasarkan stamp ID / verifier URL.

### FR-V3
System harus menghitung ulang hash file yang di-upload verifier.

### FR-V4
System harus membandingkan file hash dengan data attestation.

### FR-V5
System harus menampilkan status:
- valid,
- invalid hash mismatch,
- not found,
- pending,
- chain mismatch,
- malformed input.

---

## 11.8 Admin Features

### FR-ADM1
Admin dapat melihat status relay queue.

### FR-ADM2
Admin dapat melihat transaction failures.

### FR-ADM3
Admin dapat pause dan unpause stamping.

### FR-ADM4
Admin dapat mengalihkan ownership secara aman.

---

# 12. Non-Functional Requirements

## 12.1 Security
- private key user tidak pernah dipegang backend,
- relayer key dipisah dari owner/admin key,
- final PDF tidak boleh berubah setelah approval,
- verifikasi harus berbasis hash dan chain,
- sistem harus mencatat audit trail.

## 12.2 Reliability
- relay harus idempotent,
- queue harus tahan restart,
- hash calculation harus konsisten,
- storage harus punya fallback strategy.

## 12.3 Performance
- login harus cepat,
- preview final harus layak untuk UX,
- status pending/success harus jelas,
- verifier harus responsif untuk file ukuran umum.

## 12.4 Scalability
- render service harus bisa di-scale terpisah,
- verifier service harus bisa di-scale terpisah,
- database harus mendukung indexing riwayat dokumen,
- contract design harus siap untuk batch anchoring di V2.

## 12.5 Auditability
Semua stamping harus punya jejak:
- signer,
- originalHash,
- finalHash,
- metadataHash,
- nonce,
- txHash,
- chainId,
- timestamp,
- status.

---

# 13. System Architecture

## 13.1 Components
1. **Frontend**
2. **Auth Service**
3. **Document Service**
4. **Render Service**
5. **Storage Layer**
6. **Database**
7. **Relayer Service**
8. **Verification Service**
9. **Smart Contract (Sepolia)**

---

## 13.2 Frontend Responsibilities
- wallet connect,
- login flow,
- upload UI,
- preview PDF,
- drag-drop stamp,
- request final preview,
- request approval signing,
- show status,
- show history,
- show verifier page.

---

## 13.3 Auth Service Responsibilities
- generate login nonce,
- verify login signature,
- create session,
- revoke session,
- handle session expiration.

---

## 13.4 Document Service Responsibilities
- ingest original PDF,
- validate MIME / size,
- sanitize file,
- compute `originalHash`,
- persist original file reference.

---

## 13.5 Render Service Responsibilities
- merge placement metadata into final PDF,
- embed visual signature/stamp,
- produce exact final bytes,
- compute `finalHash`,
- build `metadataHash`,
- ensure deterministic rendering.

---

## 13.6 Storage Layer Responsibilities
- store original file,
- store final file,
- optionally pin final file to IPFS,
- manage retention policy,
- optionally support encrypted storage for sensitive docs.

---

## 13.7 Database Responsibilities
- session storage,
- document metadata indexing,
- placement draft storage,
- final document references,
- tx tracking,
- verification lookup cache,
- audit trail,
- analytics internal.

---

## 13.8 Relayer Responsibilities
- validate relay request,
- submit tx to Sepolia,
- track tx status,
- retry safely,
- update result to database.

---

## 13.9 Verification Service Responsibilities
- verify by file upload,
- verify by stamp ID,
- fetch chain receipt,
- compare hashes,
- display human-readable result.

---

## 13.10 Smart Contract Responsibilities
- verify approval digest,
- verify signer,
- consume nonce,
- emit stamp event,
- support pause/unpause,
- remain minimal and gas-efficient.

---

# 14. Data Model (Conceptual)

## 14.1 User
- userId
- walletAddress
- walletType
- createdAt
- lastLoginAt

## 14.2 Session
- sessionId
- walletAddress
- loginNonce
- issuedAt
- expiresAt
- revokedAt

## 14.3 OriginalDocument
- documentId
- ownerAddress
- filename
- fileSize
- mimeType
- originalHash
- storagePointer
- createdAt

## 14.4 StampDraft
- draftId
- documentId
- pageNumber
- x
- y
- width
- height
- visualAssetHash
- renderVersion
- createdAt

## 14.5 FinalDocument
- finalDocumentId
- documentId
- finalHash
- metadataHash
- finalStoragePointer
- ipfsCid
- privacyMode
- createdAt

## 14.6 StampApproval
- approvalId
- signer
- nonce
- deadline
- typedDataVersion
- signature
- status
- createdAt

## 14.7 ChainAttestation
- stampId
- chainId
- contractAddress
- txHash
- blockNumber
- blockTimestamp
- relayStatus
- indexedAt

## 14.8 VerificationRecord
- verificationId
- inputType
- matchedStampId
- result
- createdAt

---

# 15. Smart Contract Product Requirements

## 15.1 Contract Objective
Contract TridentZero harus menjadi **attestation registry** yang kecil, hemat gas, dan mudah diaudit.

## 15.2 Contract Philosophy
- minimal state,
- minimal roles,
- minimal business logic,
- no file storage,
- no URI storage,
- no NFT minting,
- no unnecessary complexity.

## 15.3 Main Functionality
Contract harus memiliki satu alur bisnis utama:
- menerima approval signature,
- memverifikasi signature,
- memverifikasi nonce,
- emit event stamp success.

## 15.4 Suggested OpenZeppelin Building Blocks
Untuk development smart contract, fondasi konsep yang dipakai adalah:
- `EIP712`
- `SignatureChecker`
- `Nonces`
- `Ownable2Step`
- `Pausable`

## 15.5 Why These Modules
- `EIP712`: membentuk domain dan digest typed data.
- `SignatureChecker`: support EOA dan ERC-1271.
- `Nonces`: replay protection hemat storage.
- `Ownable2Step`: admin transfer lebih aman.
- `Pausable`: emergency stop saat insiden.

## 15.6 Contract Business Rules
- signature harus valid,
- deadline belum lewat,
- nonce harus sesuai,
- contract tidak paused,
- signer harus sesuai dengan payload,
- event harus keluar tepat sekali per nonce.

## 15.7 Event Design
Event minimal harus mencakup:
- stampId,
- signer,
- nonce,
- finalHash,
- originalHash,
- metadataHash.

## 15.8 stampId
`stampId` harus:
- unik,
- deterministic,
- mudah dipakai verifier,
- tidak membutuhkan query kompleks.

## 15.9 Trust Model
Relayer **bukan** trusted signer.  
Relayer hanya pembayar gas / pengirim transaksi.  
Otorisasi tetap berasal dari signature user.

---

# 16. Typed Data Approval Model

## 16.1 Approval Payload Fields
Payload approval konseptual:
- signer
- finalHash
- originalHash
- metadataHash
- nonce
- deadline

## 16.2 Kenapa finalHash wajib
Karena finalHash adalah representasi dari exact final PDF yang dilihat dan disetujui user.

## 16.3 Kenapa originalHash tetap disimpan
Agar ada audit trail dari file asal ke file hasil stamp.

## 16.4 Kenapa metadataHash perlu
Agar placement, renderVersion, documentId, privacyMode, visual asset hash, verifier reference, dan field metadata lain bisa tetap “terikat” tanpa membuat biaya on-chain mahal.

## 16.5 Approval Constraints
- approval hanya berlaku untuk satu dokumen final,
- approval hanya berlaku untuk satu nonce,
- approval harus memiliki deadline,
- approval tidak boleh digunakan ulang.

---

# 17. Hashing & Integrity Model

## 17.1 originalHash
Hash atas file PDF original yang di-upload user.

## 17.2 finalHash
Hash atas exact bytes PDF final yang sudah mengandung visual stamp.

## 17.3 metadataHash
Hash atas metadata terstruktur, misalnya:
- page placement,
- coordinates,
- dimensions,
- render version,
- visual asset hash,
- verifier reference,
- storage mode,
- optional CID binding.

## 17.4 Integrity Principles
- yang diverifikasi publik adalah finalHash,
- originalHash dipakai untuk jejak audit,
- metadataHash dipakai untuk mengikat konteks stamp,
- database tidak boleh menjadi source of truth.

---

# 18. Storage Strategy

## 18.1 Original Document Storage
Default: private object storage.

Alasan:
- file original bisa sensitif,
- tidak semua original harus dipublikasikan,
- original tidak perlu masuk IPFS.

## 18.2 Final Document Storage
Ada dua mode:

### Private Mode
- final PDF disimpan di private storage,
- verifier publik hanya melihat receipt, bukan file.

### Public Verification Mode
- final PDF dapat dipin ke IPFS,
- verifier dapat mengunduh file final dari IPFS atau gateway.

## 18.3 IPFS Policy
IPFS bersifat content-addressed, tetapi persistence perlu pinning.  
Karena itu:
- harus ada pinning policy,
- harus ada fallback storage,
- untuk dokumen sensitif, file harus dienkripsi dulu atau tidak diunggah ke IPFS publik.

## 18.4 Why Not Store File On-Chain
Karena:
- biaya sangat mahal,
- tidak efisien,
- tidak perlu untuk use case verifikasi.

---

# 19. Why Database Is Still Needed

Meskipun memakai blockchain, database tetap diperlukan untuk:

## 19.1 Session Management
- login nonce,
- session token,
- expiration,
- logout.

## 19.2 Document Indexing
- daftar dokumen user,
- filter,
- status,
- sorting,
- riwayat.

## 19.3 Draft Placement
- placement sementara sebelum final rendering.

## 19.4 Relay Tracking
- txHash,
- relay status,
- retry attempts,
- explorer reference.

## 19.5 Verification UX
- quick lookup by stampId,
- result caching,
- human-readable receipt page.

## 19.6 Internal Analytics
- volume stamping,
- success/failure rates,
- relay latency,
- render errors.

Database adalah **UX/indexing layer**, bukan trust layer.

---

# 20. Verification Model

## 20.1 Verification by Final PDF
Flow:
1. verifier upload final PDF,
2. system hitung finalHash,
3. system cari attestation yang cocok,
4. system cek event on-chain,
5. system tampilkan hasil.

## 20.2 Verification by Stamp ID
Flow:
1. verifier input stamp ID atau buka verifier URL,
2. system ambil receipt,
3. system tampilkan signer, tx hash, timestamp, chain,
4. verifier bisa upload file bila ingin mencocokkan hash.

## 20.3 Verification Outputs
- **Valid**
- **Invalid — hash mismatch**
- **Invalid — attestation not found**
- **Pending**
- **Invalid — chain mismatch**
- **Invalid — malformed document**

## 20.4 Human-readable Result
Verifier page harus menjelaskan:
- siapa signer,
- kapan stamped,
- network apa,
- dokumen cocok atau tidak,
- apakah bukti on-chain ditemukan.

---

# 21. Gas Optimization Strategy

## 21.1 Core Principles
- satu fungsi inti,
- event-first,
- storage-light,
- no file storage,
- no strings on-chain,
- no NFT,
- no proxy in MVP,
- single nonce counter per signer.

## 21.2 Why Nonce Counter Matters
Menggunakan counter per address lebih hemat daripada membuat slot storage baru untuk setiap requestId.

## 21.3 Why Event-first Matters
Event cukup untuk audit dan indexing off-chain tanpa membuat on-chain state membengkak.

## 21.4 Avoid Unnecessary Features
Fitur berikut sengaja tidak dipakai di MVP untuk menghemat gas dan kompleksitas:
- NFT minting,
- enumerable registries,
- on-chain URI storage,
- on-chain document lists,
- multi-contract routing,
- upgradeable proxy.

## 21.5 Future Gas Optimization Path
Untuk V2:
- batch anchoring via Merkle root,
- aggregate stamping,
- move to production L2,
- queue optimizations.

---

# 22. Security Requirements

## 22.1 Wallet Security
- private key user tidak boleh pernah disentuh backend,
- approval hanya boleh dilakukan melalui wallet user.

## 22.2 Replay Protection
- nonce wajib,
- deadline wajib,
- domain binding wajib.

## 22.3 Signature Security
- verifier harus mengikat signer, hash, dan context,
- contract harus menolak signature invalid,
- contract harus menolak signature replay.

## 22.4 Smart Contract Wallet Security
- sistem harus menerima ERC-1271,
- verifier harus sadar bahwa contract-based signature bersifat historis dan diverifikasi melalui keberhasilan transaksi di chain.

## 22.5 PDF Security
- PDF harus divalidasi dan disanitasi,
- file berbahaya harus ditolak,
- final bytes harus immutable setelah approval.

## 22.6 Admin Security
- owner sebaiknya multisig sesegera mungkin,
- owner dan relayer key wajib dipisah,
- incident pause harus tersedia.

## 22.7 Storage Security
- original file default private,
- dokumen sensitif tidak boleh ke IPFS publik tanpa perlindungan,
- access control storage harus diaudit.

---

# 23. Admin & Operational Requirements

## 23.1 Admin Controls
- pause stamping,
- unpause stamping,
- transfer ownership,
- inspect relay failures,
- inspect verification mismatches.

## 23.2 Monitoring
Harus ada monitoring untuk:
- pending tx terlalu lama,
- relay failures,
- pause/unpause events,
- ownership changes,
- repeated signature errors,
- verification mismatch spikes.

## 23.3 Audit Logging
Sistem harus mencatat:
- login attempts,
- upload events,
- render events,
- approval creation,
- relay results,
- admin actions,
- verification attempts.

---

# 24. API Surface (Conceptual)

## 24.1 Auth APIs
- create login challenge
- verify login
- logout
- get current session

## 24.2 Document APIs
- upload original document
- get original document metadata
- save stamp placement draft
- render final preview
- get final draft summary

## 24.3 Approval APIs
- create approval payload
- submit signed approval
- get approval status

## 24.4 Relay APIs
- enqueue relay
- get relay status
- fetch receipt

## 24.5 Verification APIs
- verify by stampId
- verify by file upload
- fetch public verifier data

## 24.6 Admin APIs
- list relay failures
- list pending approvals
- list suspicious mismatches
- trigger pause workflow hook

---

# 25. UX Requirements

## 25.1 Login UX
- user harus jelas kapan login dan kapan approval dokumen,
- jangan mencampur login signature dengan approval signature.

## 25.2 Upload UX
- status upload harus jelas,
- error file invalid harus jelas,
- preview harus cepat.

## 25.3 Stamping UX
- drag-drop harus intuitif,
- resize dan reposition harus stabil,
- user harus melihat preview final sebelum sign.

## 25.4 Signing UX
- tampilkan ringkasan final dokumen:
  - nama file,
  - signer,
  - expiry/deadline,
  - chain,
  - ringkasan tindakan.

## 25.5 Post-Stamp UX
- tampilkan status: pending / confirmed / failed,
- sediakan tombol download final PDF,
- sediakan receipt,
- sediakan verifier URL.

## 25.6 Verification UX
- verifier harus mudah dipahami non-teknis,
- tampilkan valid/tidak dengan jelas,
- tampilkan detail teknis sebagai advanced section.

---

# 26. Success Metrics

## 26.1 Product Metrics
- login success rate,
- upload success rate,
- render success rate,
- stamp completion rate,
- verifier success rate,
- abandonment rate.

## 26.2 Technical Metrics
- average render latency,
- average relay latency,
- tx success rate,
- gas per stamp,
- retry rate,
- hash mismatch incidents.

## 26.3 Security Metrics
- replay attempts blocked,
- expired approvals blocked,
- failed signature validations,
- admin incident count,
- storage access anomalies.

---

# 27. Rollout Plan

## Phase 0 — Specification Freeze
Output:
- typed data schema fixed,
- event schema fixed,
- storage policy fixed,
- trust model fixed,
- privacy modes fixed.

## Phase 1 — Local Prototype
Output:
- working local flow,
- deterministic PDF finalization,
- basic verifier,
- contract prototype locally tested.

## Phase 2 — Smart Contract Alpha
Output:
- minimal registry contract,
- EOA validation,
- ERC-1271 validation,
- nonce and pause behavior tested.

## Phase 3 — Sepolia Beta
Output:
- deployed and verified contract on Sepolia,
- live end-to-end flow,
- real wallet testing,
- tx tracking active,
- admin monitoring active.

## Phase 4 — Hardening
Output:
- multisig admin,
- incident runbooks,
- improved observability,
- security review,
- retention and privacy review.

## Phase 5 — V2 Planning
Output:
- batch anchoring evaluation,
- production chain decision,
- multi-signer architecture draft,
- enterprise mode draft.

---

# 28. Testing Strategy

## 28.1 Functional Tests
- login flow,
- upload flow,
- preview flow,
- placement flow,
- final render flow,
- approval flow,
- relay flow,
- receipt generation,
- verifier success.

## 28.2 Negative Tests
- invalid PDF,
- oversized file,
- tampered final file,
- mismatched signer,
- wrong nonce,
- expired approval,
- paused contract.

## 28.3 Smart Contract Tests
- valid EOA accepted,
- valid ERC-1271 accepted,
- invalid signature rejected,
- replay rejected,
- expired deadline rejected,
- wrong nonce rejected,
- paused state blocks stamping.

## 28.4 Reliability Tests
- relayer restart,
- storage temporary failure,
- database restart,
- explorer lag,
- delayed pending tx.

## 28.5 Security Tests
- malicious PDF,
- duplicated approval submission,
- signature substitution,
- forged verifier lookup,
- admin misconfiguration.

---

# 29. Risks & Mitigations

## Risk 1 — Final PDF berubah setelah user sign
**Mitigation:**  
Freeze final bytes sebelum signing. Jangan modifikasi file setelah approval.

## Risk 2 — IPFS availability rendah
**Mitigation:**  
Gunakan pinning + backup storage + fallback retrieval.

## Risk 3 — Smart wallet verification ambigu
**Mitigation:**  
Gunakan approval historical model berbasis successful on-chain attestation.

## Risk 4 — Admin key compromise
**Mitigation:**  
Pindahkan owner ke multisig, pisahkan relayer key, aktifkan pause mechanism.

## Risk 5 — Gas meningkat
**Mitigation:**  
Pertahankan event-first minimal contract, evaluasi batch anchoring di V2.

## Risk 6 — Dokumen sensitif bocor
**Mitigation:**  
Default private mode, gunakan protected storage, gunakan encryption bila perlu.

## Risk 7 — Relay queue race condition
**Mitigation:**  
Idempotent job handling, status machine jelas, retry terbatas.

---

# 30. Open Questions

1. Apakah default final file bersifat private atau public-verifiable?
2. Apakah verifier publik wajib bisa mengunduh file final?
3. Apakah visual stamp harus mencantumkan wallet address?
4. Apakah verifier akan menampilkan alias/ENS bila ada?
5. Apakah approval deadline dibuat tetap atau configurable?
6. Apakah owner langsung multisig sejak alpha?
7. Apakah IPFS hanya dipakai untuk final PDF atau juga metadata publik?
8. Apakah V1 perlu watermark / QR di semua final PDF?

---

# 31. Definition of Done (MVP)

TridentZero MVP dianggap selesai bila:

1. User dapat login dengan wallet.
2. User dapat upload PDF.
3. User dapat menaruh visual stamp di PDF.
4. System dapat merender final PDF yang deterministic.
5. User dapat sign approval final PDF.
6. Relayer dapat mengirim attestation ke Sepolia.
7. Contract emit event yang benar.
8. User dapat mengunduh final PDF dan receipt.
9. Verifier dapat memvalidasi final PDF terhadap on-chain proof.
10. Admin dapat pause/unpause sistem.
11. Semua flow inti lulus uji di local dan Sepolia.

---

# 32. Final Recommended Architecture

## 32.1 Final Stack Concept
- **Wallet Login:** SIWE-style wallet login
- **Approval:** typed data signature for final PDF approval
- **Chain:** Sepolia
- **Contract Style:** minimal OpenZeppelin-based attestation registry
- **Storage:** private object storage + optional IPFS for final file
- **Database:** session, metadata, indexing, tx tracking
- **Verifier:** hash-based verification + on-chain receipt lookup

## 32.2 Final Product Principle
**TridentZero adalah hybrid Web3 document stamping system**:
- user experience tetap seperti aplikasi modern biasa,
- bukti approval tetap berbasis wallet dan blockchain,
- biaya tetap rendah karena chain hanya menyimpan bukti minimal.

---

# 33. Future Roadmap After MVP

## V2 Candidates
- multi-signer workflow,
- organization/team signing,
- delegated approver flows,
- Merkle batch anchoring,
- enterprise privacy modes,
- selective public/private receipt,
- production L2 deployment,
- API access for third-party platforms.

## V3 Candidates
- legal/compliance integrations,
- advanced workflow policy engine,
- archival proofs,
- verifiable credential integration,
- document lifecycle automation.

---

# 34. Summary

TridentZero dirancang sebagai sistem stamping dokumen Web3 yang:
- simpel bagi user,
- verifiable secara publik,
- efisien secara gas,
- scalable secara arsitektur,
- aman secara trust model.

Konsep utamanya:
- **login wallet**
- **upload PDF**
- **drag-and-drop visual stamp**
- **render final PDF**
- **wallet approval**
- **on-chain attestation**
- **public verification**

MVP TridentZero akan fokus membuktikan bahwa:
1. user non-teknis bisa menyelesaikan flow ini dengan mudah,
2. final PDF dapat diverifikasi secara independen,
3. smart contract tetap minimal dan murah,
4. arsitektur siap ditumbuhkan ke versi production.

---