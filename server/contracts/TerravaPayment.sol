// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TerravaPayment {
    struct PaymentRecord {
        uint256 listingId;
        uint256 transactionId;
        string  buyerName;
        string  sellerName;
        uint256 amountPhp;
        string  paymentMethod;
        uint256 timestamp;
    }

    PaymentRecord[] public records;

    event PaymentRecorded(
        uint256 indexed transactionId,
        uint256 indexed listingId,
        string  buyerName,
        uint256 amountPhp,
        uint256 timestamp
    );

    function recordPayment(
        uint256 _listingId,
        uint256 _transactionId,
        string  memory _buyerName,
        string  memory _sellerName,
        uint256 _amountPhp,
        string  memory _paymentMethod
    ) public {
        records.push(PaymentRecord({
            listingId:     _listingId,
            transactionId: _transactionId,
            buyerName:     _buyerName,
            sellerName:    _sellerName,
            amountPhp:     _amountPhp,
            paymentMethod: _paymentMethod,
            timestamp:     block.timestamp
        }));

        emit PaymentRecorded(
            _transactionId,
            _listingId,
            _buyerName,
            _amountPhp,
            block.timestamp
        );
    }

    function getRecord(uint256 index) public view returns (PaymentRecord memory) {
        require(index < records.length, "Index out of bounds");
        return records[index];
    }

    function getRecordCount() public view returns (uint256) {
        return records.length;
    }
}
