// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Certification {
    address public admin;

    struct Diploma {
        uint256 id;
        string studentName;
        string major;
        string classification;
        uint256 issueDate;
        bool isValid;
    }

    mapping(uint256 => Diploma) public diplomas;
    uint256[] public allIds;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin");
        _;
    }

    function issueDiploma(uint256 _id, string memory _name, string memory _major, string memory _class) public {
        require(diplomas[_id].id == 0, "ID exists");
        diplomas[_id] = Diploma(_id, _name, _major, _class, block.timestamp, false);
        allIds.push(_id);
    }

    function approveDiploma(uint256 _id) public onlyAdmin {
        require(diplomas[_id].id != 0, "Not found");
        diplomas[_id].isValid = true;
    }

    function getPendingDiplomas() public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allIds.length; i++) {
            if (!diplomas[allIds[i]].isValid) count++;
        }
        uint256[] memory pending = new uint256[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < allIds.length; i++) {
            if (!diplomas[allIds[i]].isValid) {
                pending[j] = allIds[i];
                j++;
            }
        }
        return pending;
    }

    function verifyDiploma(uint256 _id) public view returns (string memory, string memory, string memory, uint256, bool) {
        require(diplomas[_id].id != 0, "Not found");
        Diploma memory d = diplomas[_id];
        return (d.studentName, d.major, d.classification, d.issueDate, d.isValid);
    }
}