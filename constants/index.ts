export const ESCROW_CONTRACT_ADDRESS = "0x9e2bb48da7C201a379C838D9FACfB280819Ca104";
export const USDT_TOKEN_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

// Minimal ABI for ERC20 Approve
export const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// FULL ABI for AhadiEscrowFinal
export const ESCROW_ABI = [
  // --- USER FUNCTIONS ---
  {
    inputs: [
      { name: "_seller", type: "address" },
      { name: "_amount", type: "uint256" },
      { name: "_timeoutSeconds", type: "uint256" }
    ],
    name: "createDeal",
    outputs: [{ name: "dealId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_dealId", type: "uint256" }],
    name: "releaseFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_dealId", type: "uint256" }],
    name: "refundBuyer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_dealId", type: "uint256" }],
    name: "refundTimedOutDeal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_dealId", type: "uint256" }],
    name: "raiseDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  // --- ADMIN FUNCTIONS ---
  {
    inputs: [
      { name: "_dealId", type: "uint256" },
      { name: "_winner", type: "address" }
    ],
    name: "resolveDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_newFee", type: "uint256" }],
    name: "updateFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_newWallet", type: "address" }],
    name: "updateFeeWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  // --- VIEW FUNCTIONS ---
  {
    inputs: [],
    name: "getContractStats",
    outputs: [
      { name: "totalDeals", type: "uint256" },
      { name: "locked", type: "uint256" },
      { name: "balance", type: "uint256" },
      { name: "excess", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "feeBasisPoints",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_dealId", type: "uint256" }],
    name: "getDeal",
    outputs: [
        {
            components: [
                { name: "id", type: "uint256" },
                { name: "buyer", type: "address" },
                { name: "seller", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "isCompleted", type: "bool" },
                { name: "isDisputed", type: "bool" },
                { name: "createdAt", type: "uint256" },
                { name: "expiryTime", type: "uint256" }
            ],
            name: "",
            type: "tuple"
        }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;