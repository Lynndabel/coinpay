// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CoinPay
 * @notice A payment gateway smart contract for secure cryptocurrency payments
 * @dev Supports payment processing, escrow, and refund functionality
 */
contract CoinPay {
    // Payment status enum
    enum PaymentStatus {
        Pending,
        Completed,
        Refunded,
        Cancelled
    }

    // Payment structure
    struct Payment {
        uint256 id;
        address payer;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        PaymentStatus status;
        string description;
        bool exists;
    }

    // Events
    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        string description
    );

    event PaymentCompleted(
        uint256 indexed paymentId,
        address indexed recipient,
        uint256 amount
    );

    event PaymentRefunded(
        uint256 indexed paymentId,
        address indexed payer,
        uint256 amount
    );

    event PaymentCancelled(
        uint256 indexed paymentId,
        address indexed payer,
        uint256 amount
    );

    // State variables
    address public owner;
    uint256 private paymentCounter;
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256[]) public userPayments;
    
    // Platform fee (in basis points, e.g., 25 = 0.25%)
    uint256 public platformFeeBps = 25; // 0.25%
    address public feeRecipient;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "CoinPay: Not owner");
        _;
    }

    modifier validPayment(uint256 _paymentId) {
        require(payments[_paymentId].exists, "CoinPay: Payment does not exist");
        _;
    }

    /**
     * @notice Constructor sets the contract owner and fee recipient
     * @param _feeRecipient Address to receive platform fees
     */
    constructor(address _feeRecipient) {
        owner = msg.sender;
        feeRecipient = _feeRecipient;
        paymentCounter = 0;
    }

    /**
     * @notice Create a payment request
     * @param _recipient Address of the payment recipient
     * @param _description Optional description of the payment
     * @return paymentId The ID of the created payment
     */
    function createPayment(
        address _recipient,
        string memory _description
    ) external payable returns (uint256) {
        require(_recipient != address(0), "CoinPay: Invalid recipient");
        require(_recipient != msg.sender, "CoinPay: Cannot pay yourself");
        require(msg.value > 0, "CoinPay: Amount must be greater than 0");

        paymentCounter++;
        uint256 paymentId = paymentCounter;

        Payment memory newPayment = Payment({
            id: paymentId,
            payer: msg.sender,
            recipient: _recipient,
            amount: msg.value,
            timestamp: block.timestamp,
            status: PaymentStatus.Pending,
            description: _description,
            exists: true
        });

        payments[paymentId] = newPayment;
        userPayments[msg.sender].push(paymentId);

        emit PaymentCreated(
            paymentId,
            msg.sender,
            _recipient,
            msg.value,
            _description
        );

        // Auto-complete payment (can be modified for escrow functionality)
        _completePayment(paymentId);

        return paymentId;
    }

    /**
     * @notice Complete a pending payment (internal function)
     * @param _paymentId The ID of the payment to complete
     */
    function _completePayment(uint256 _paymentId) internal {
        Payment storage payment = payments[_paymentId];
        require(
            payment.status == PaymentStatus.Pending,
            "CoinPay: Payment not pending"
        );

        payment.status = PaymentStatus.Completed;

        // Calculate and transfer platform fee
        uint256 feeAmount = (payment.amount * platformFeeBps) / 10000;
        uint256 recipientAmount = payment.amount - feeAmount;

        // Transfer fee to fee recipient
        if (feeAmount > 0 && feeRecipient != address(0)) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: feeAmount}(
                ""
            );
            require(feeSuccess, "CoinPay: Fee transfer failed");
        }

        // Transfer remaining amount to recipient
        (bool success, ) = payable(payment.recipient).call{
            value: recipientAmount
        }("");
        require(success, "CoinPay: Payment transfer failed");

        emit PaymentCompleted(_paymentId, payment.recipient, recipientAmount);
    }

    /**
     * @notice Refund a payment (only payer can refund)
     * @param _paymentId The ID of the payment to refund
     */
    function refundPayment(
        uint256 _paymentId
    ) external validPayment(_paymentId) {
        Payment storage payment = payments[_paymentId];
        require(
            msg.sender == payment.payer || msg.sender == owner,
            "CoinPay: Unauthorized"
        );
        require(
            payment.status == PaymentStatus.Pending ||
                payment.status == PaymentStatus.Completed,
            "CoinPay: Cannot refund this payment"
        );

        payment.status = PaymentStatus.Refunded;

        uint256 refundAmount = payment.amount;
        (bool success, ) = payable(payment.payer).call{value: refundAmount}(
            ""
        );
        require(success, "CoinPay: Refund transfer failed");

        emit PaymentRefunded(_paymentId, payment.payer, refundAmount);
    }

    /**
     * @notice Cancel a pending payment
     * @param _paymentId The ID of the payment to cancel
     */
    function cancelPayment(
        uint256 _paymentId
    ) external validPayment(_paymentId) {
        Payment storage payment = payments[_paymentId];
        require(
            msg.sender == payment.payer || msg.sender == owner,
            "CoinPay: Unauthorized"
        );
        require(
            payment.status == PaymentStatus.Pending,
            "CoinPay: Only pending payments can be cancelled"
        );

        payment.status = PaymentStatus.Cancelled;

        uint256 refundAmount = payment.amount;
        (bool success, ) = payable(payment.payer).call{value: refundAmount}(
            ""
        );
        require(success, "CoinPay: Cancel transfer failed");

        emit PaymentCancelled(_paymentId, payment.payer, refundAmount);
    }

    /**
     * @notice Get payment details
     * @param _paymentId The ID of the payment
     * @return Payment struct containing payment details
     */
    function getPayment(
        uint256 _paymentId
    ) external view validPayment(_paymentId) returns (Payment memory) {
        return payments[_paymentId];
    }

    /**
     * @notice Get all payment IDs for a user
     * @param _user Address of the user
     * @return Array of payment IDs
     */
    function getUserPayments(
        address _user
    ) external view returns (uint256[] memory) {
        return userPayments[_user];
    }

    /**
     * @notice Get payment count
     * @return Total number of payments created
     */
    function getPaymentCount() external view returns (uint256) {
        return paymentCounter;
    }

    /**
     * @notice Update platform fee (only owner)
     * @param _newFeeBps New fee in basis points
     */
    function updatePlatformFee(
        uint256 _newFeeBps
    ) external onlyOwner {
        require(_newFeeBps <= 1000, "CoinPay: Fee cannot exceed 10%");
        platformFeeBps = _newFeeBps;
    }

    /**
     * @notice Update fee recipient (only owner)
     * @param _newFeeRecipient New fee recipient address
     */
    function updateFeeRecipient(
        address _newFeeRecipient
    ) external onlyOwner {
        require(_newFeeRecipient != address(0), "CoinPay: Invalid address");
        feeRecipient = _newFeeRecipient;
    }

    /**
     * @notice Get contract balance
     * @return Contract's ETH balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "CoinPay: No balance to withdraw");

        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "CoinPay: Withdrawal failed");
    }

    // Receive function to accept ETH
    receive() external payable {
        revert("CoinPay: Use createPayment function");
    }

    // Fallback function
    fallback() external payable {
        revert("CoinPay: Function not found");
    }
}

