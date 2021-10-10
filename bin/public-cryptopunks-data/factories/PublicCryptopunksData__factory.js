"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicCryptopunksData__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "contract CryptopunksData",
                name: "_cryptopunksData",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "SVG_FOOTER",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "SVG_HEADER",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint8",
                name: "index",
                type: "uint8",
            },
            {
                internalType: "bytes",
                name: "encoding",
                type: "bytes",
            },
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
        ],
        name: "addAsset",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint64",
                name: "key1",
                type: "uint64",
            },
            {
                internalType: "uint32",
                name: "value1",
                type: "uint32",
            },
            {
                internalType: "uint64",
                name: "key2",
                type: "uint64",
            },
            {
                internalType: "uint32",
                name: "value2",
                type: "uint32",
            },
            {
                internalType: "uint64",
                name: "key3",
                type: "uint64",
            },
            {
                internalType: "uint32",
                name: "value3",
                type: "uint32",
            },
            {
                internalType: "uint64",
                name: "key4",
                type: "uint64",
            },
            {
                internalType: "uint32",
                name: "value4",
                type: "uint32",
            },
        ],
        name: "addComposites",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        name: "assetNames",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        name: "assets",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint64",
                name: "",
                type: "uint64",
            },
        ],
        name: "composites",
        outputs: [
            {
                internalType: "uint32",
                name: "",
                type: "uint32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "cryptopunksData",
        outputs: [
            {
                internalType: "contract CryptopunksData",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint96",
                name: "packed",
                type: "uint96",
            },
        ],
        name: "getPackedAssetNames",
        outputs: [
            {
                internalType: "string",
                name: "text",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint96",
                name: "packed",
                type: "uint96",
            },
            {
                internalType: "uint16",
                name: "punkIndex",
                type: "uint16",
            },
        ],
        name: "isPackedEqualToOriginalPunkIndex",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint8[12]",
                name: "assetsArr",
                type: "uint8[12]",
            },
        ],
        name: "packAssets",
        outputs: [
            {
                internalType: "uint96",
                name: "",
                type: "uint96",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [],
        name: "palette",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint96",
                name: "packed",
                type: "uint96",
            },
        ],
        name: "render",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint96",
                name: "packed",
                type: "uint96",
            },
        ],
        name: "renderSvg",
        outputs: [
            {
                internalType: "string",
                name: "svg",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "sealContract",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes",
                name: "_palette",
                type: "bytes",
            },
        ],
        name: "setPalette",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
class PublicCryptopunksData__factory {
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.PublicCryptopunksData__factory = PublicCryptopunksData__factory;
PublicCryptopunksData__factory.abi = _abi;
//# sourceMappingURL=PublicCryptopunksData__factory.js.map