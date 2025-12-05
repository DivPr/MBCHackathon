// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SimpleBadgeNFT
 * @dev A premium NFT with elaborate on-chain SVG badges
 */
contract SimpleBadgeNFT is ERC721 {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    event BadgeMinted(address indexed to, uint256 indexed tokenId);

    constructor() ERC721("SimpleBadgeNFT", "SBADGE") {}

    /**
     * @dev Mint a new badge NFT to the given address
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
     * @dev Get badge colors based on token ID (primary, secondary, accent)
     */
    function _getColors(uint256 tokenId) internal pure returns (string memory, string memory, string memory) {
        uint256 idx = tokenId % 8;
        
        // Primary, Secondary, Accent color schemes
        if (idx == 0) return ("#FF6B6B", "#FF8E8E", "#FFD93D"); // Coral + Gold
        if (idx == 1) return ("#4ECDC4", "#7EDDD6", "#FF6B6B"); // Teal + Coral
        if (idx == 2) return ("#45B7D1", "#72CAE0", "#F7DC6F"); // Sky + Gold
        if (idx == 3) return ("#9B59B6", "#BB7ED1", "#3498DB"); // Purple + Blue
        if (idx == 4) return ("#E74C3C", "#F1948A", "#F39C12"); // Red + Orange
        if (idx == 5) return ("#1ABC9C", "#48DAC4", "#9B59B6"); // Emerald + Purple
        if (idx == 6) return ("#3498DB", "#5DADE2", "#E74C3C"); // Blue + Red
        return ("#F39C12", "#F7B731", "#E74C3C"); // Gold + Red
    }

    /**
     * @dev SVG definitions (gradients, filters)
     */
    function _svgDefs(string memory primary, string memory secondary, string memory accent) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#0f0f1a"/>',
            '<stop offset="50%" style="stop-color:#1a1a2e"/>',
            '<stop offset="100%" style="stop-color:#0f0f1a"/>',
            '</linearGradient>',
            '<linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', primary, '"/>',
            '<stop offset="100%" style="stop-color:', secondary, '"/>',
            '</linearGradient>',
            '<linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:white;stop-opacity:0.4"/>',
            '<stop offset="50%" style="stop-color:white;stop-opacity:0"/>',
            '</linearGradient>',
            '<linearGradient id="accent" x1="0%" y1="0%" x2="0%" y2="100%">',
            '<stop offset="0%" style="stop-color:', accent, '"/>',
            '<stop offset="100%" style="stop-color:', primary, '"/>',
            '</linearGradient>',
            '<filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>',
            '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
            '</defs>'
        ));
    }

    /**
     * @dev Background with decorative elements
     */
    function _svgBackground(string memory primary) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<rect width="400" height="400" fill="url(#bg)"/>',
            // Outer ring
            '<circle cx="200" cy="185" r="140" fill="none" stroke="', primary, '" stroke-width="1" opacity="0.3"/>',
            '<circle cx="200" cy="185" r="130" fill="none" stroke="', primary, '" stroke-width="0.5" opacity="0.2"/>',
            // Corner decorations
            '<path d="M20,20 L60,20 L20,60 Z" fill="', primary, '" opacity="0.15"/>',
            '<path d="M380,20 L340,20 L380,60 Z" fill="', primary, '" opacity="0.15"/>',
            '<path d="M20,380 L60,380 L20,340 Z" fill="', primary, '" opacity="0.15"/>',
            '<path d="M380,380 L340,380 L380,340 Z" fill="', primary, '" opacity="0.15"/>'
        ));
    }

    /**
     * @dev Radiating rays behind the badge
     */
    function _svgRays(string memory accent) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<g opacity="0.15">',
            '<polygon points="200,185 160,40 240,40" fill="', accent, '"/>',
            '<polygon points="200,185 340,145 340,225" fill="', accent, '"/>',
            '<polygon points="200,185 160,330 240,330" fill="', accent, '"/>',
            '<polygon points="200,185 60,145 60,225" fill="', accent, '"/>',
            '</g>'
        ));
    }

    /**
     * @dev Main badge shape - elaborate star with inner details
     */
    function _svgBadgeShape() internal pure returns (string memory) {
        return string(abi.encodePacked(
            // Outer glow
            '<polygon points="200,60 220,130 295,130 235,175 255,245 200,205 145,245 165,175 105,130 180,130" ',
            'fill="url(#badge)" filter="url(#glow)"/>',
            // Main star
            '<polygon points="200,70 218,132 290,132 232,172 250,238 200,200 150,238 168,172 110,132 182,132" ',
            'fill="url(#badge)"/>',
            // Inner star highlight
            '<polygon points="200,90 212,135 265,135 222,165 235,215 200,185 165,215 178,165 135,135 188,135" ',
            'fill="url(#shine)"/>',
            // Center circle
            '<circle cx="200" cy="160" r="45" fill="url(#accent)"/>',
            '<circle cx="200" cy="160" r="38" fill="#1a1a2e"/>',
            '<circle cx="200" cy="160" r="32" fill="url(#badge)"/>'
        ));
    }

    /**
     * @dev Trophy/achievement icon in center
     */
    function _svgCenterIcon() internal pure returns (string memory) {
        return string(abi.encodePacked(
            // Lightning bolt icon (achievement symbol)
            '<path d="M208,145 L198,160 L206,160 L196,178 L210,158 L202,158 Z" fill="#1a1a2e"/>',
            '<path d="M207,146 L197,161 L205,161 L195,177 L209,159 L201,159 Z" fill="white"/>'
        ));
    }

    /**
     * @dev Bottom banner with text
     */
    function _svgBanner(uint256 tokenId, string memory primary) internal pure returns (string memory) {
        return string(abi.encodePacked(
            // Banner ribbon
            '<path d="M100,300 L120,285 L280,285 L300,300 L280,315 L120,315 Z" fill="', primary, '"/>',
            '<path d="M100,300 L120,285 L130,300 L120,315 Z" fill="#0f0f1a" opacity="0.3"/>',
            '<path d="M300,300 L280,285 L270,300 L280,315 Z" fill="#0f0f1a" opacity="0.3"/>',
            // Text
            '<text x="200" y="306" font-family="Arial,sans-serif" font-size="16" fill="white" text-anchor="middle" font-weight="bold">STRIDE CHAMPION</text>',
            // Token number below
            '<text x="200" y="355" font-family="Arial,sans-serif" font-size="24" fill="', primary, '" text-anchor="middle" font-weight="bold">#', tokenId.toString(), '</text>',
            // Small stars decoration
            '<text x="160" y="355" font-size="12" fill="', primary, '">&#9733;</text>',
            '<text x="232" y="355" font-size="12" fill="', primary, '">&#9733;</text>'
        ));
    }

    /**
     * @dev Generate complete SVG
     */
    function generateSVG(uint256 tokenId) public pure returns (string memory) {
        (string memory primary, string memory secondary, string memory accent) = _getColors(tokenId);
        
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
            _svgDefs(primary, secondary, accent),
            _svgBackground(primary),
            _svgRays(accent),
            _svgBadgeShape(),
            _svgCenterIcon(),
            _svgBanner(tokenId, primary),
            '</svg>'
        ));
    }

    /**
     * @dev Returns the token URI with on-chain SVG and metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory svg = generateSVG(tokenId);
        (string memory primary, , ) = _getColors(tokenId);
        string memory svgBase64 = Base64.encode(bytes(svg));
        
        bytes memory json = abi.encodePacked(
            '{"name":"Stride Champion #', tokenId.toString(),
            '","description":"An elite badge awarded to champions who conquer fitness challenges on Stride. This badge represents dedication, perseverance, and victory.",',
            '"attributes":[{"trait_type":"Badge Color","value":"', primary, '"},',
            '{"trait_type":"Badge Number","value":', tokenId.toString(), '},',
            '{"trait_type":"Rarity","value":"Champion"}],',
            '"image":"data:image/svg+xml;base64,', svgBase64, '"}'
        );

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(json)
        ));
    }
}
