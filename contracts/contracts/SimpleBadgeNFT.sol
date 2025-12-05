// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SimpleBadgeNFT
 * @dev A simple NFT with on-chain SVG images for hackathon use
 */
contract SimpleBadgeNFT is ERC721 {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    event BadgeMinted(address indexed to, uint256 indexed tokenId);

    constructor() ERC721("SimpleBadgeNFT", "SBADGE") {}

    /**
     * @dev Mint a new badge NFT to the given address
     * @param to The address to mint the NFT to
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        
        emit BadgeMinted(to, tokenId);
        
        return tokenId;
    }

    /**
     * @dev Get the total number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Get badge color based on token ID
     */
    function _getColor(uint256 tokenId) internal pure returns (string memory) {
        string[8] memory colors = [
            "#FF6B6B",  // Coral Red
            "#4ECDC4",  // Teal
            "#45B7D1",  // Sky Blue
            "#96CEB4",  // Sage Green
            "#FFEAA7",  // Soft Yellow
            "#DDA0DD",  // Plum
            "#98D8C8",  // Mint
            "#F7DC6F"   // Gold
        ];
        return colors[tokenId % 8];
    }

    /**
     * @dev Generate SVG image for the badge - split into parts to avoid stack too deep
     */
    function _svgHeader() internal pure returns (string memory) {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">'
               '<rect width="400" height="400" fill="#1a1a2e"/>';
    }

    function _svgBadge(string memory color) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<circle cx="200" cy="170" r="80" fill="', color, '"/>',
            '<polygon points="200,90 225,145 285,155 240,195 252,255 200,225 148,255 160,195 115,155 175,145" fill="', color, '"/>'
        ));
    }

    function _svgText(uint256 tokenId, string memory color) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<text x="200" y="320" font-family="Arial" font-size="22" fill="white" text-anchor="middle" font-weight="bold">STRIDE BADGE</text>',
            '<text x="200" y="355" font-family="Arial" font-size="16" fill="', color, '" text-anchor="middle">#', tokenId.toString(), '</text>',
            '</svg>'
        ));
    }

    /**
     * @dev Generate complete SVG
     */
    function generateSVG(uint256 tokenId) public pure returns (string memory) {
        string memory color = _getColor(tokenId);
        return string(abi.encodePacked(
            _svgHeader(),
            _svgBadge(color),
            _svgText(tokenId, color)
        ));
    }

    /**
     * @dev Returns the token URI with on-chain SVG and metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory svg = generateSVG(tokenId);
        string memory color = _getColor(tokenId);
        string memory svgBase64 = Base64.encode(bytes(svg));
        
        bytes memory json = abi.encodePacked(
            '{"name":"Stride Badge #', tokenId.toString(),
            '","description":"A badge earned through completing fitness challenges on Stride.",',
            '"attributes":[{"trait_type":"Badge Color","value":"', color, '"},',
            '{"trait_type":"Badge Number","value":', tokenId.toString(), '}],',
            '"image":"data:image/svg+xml;base64,', svgBase64, '"}'
        );

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(json)
        ));
    }
}
