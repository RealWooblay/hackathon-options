import { TransferTransaction, Hbar } from "@hashgraph/sdk";

export async function sendHbarFcn(walletData, senderAccountId) {
    const escrowAccountId = process.env.REACT_APP_ESCROW_ID;
    console.log(escrowAccountId);
    console.log(`\n=======================================`);
    console.log(`- Sending HBAR from ${senderAccountId} to ${escrowAccountId}...`);

    const hashconnect = walletData[0];
    const saveData = walletData[1];

    const provider = hashconnect.getProvider("testnet", saveData.topic, senderAccountId);
    const signer = hashconnect.getSigner(provider);

    try {
        const transferTx = await new TransferTransaction()
            .addHbarTransfer(senderAccountId, new Hbar(-1)) // Deduct 1 HBAR from sender
            .addHbarTransfer(escrowAccountId, new Hbar(1)) // Add 1 HBAR to recipient
            .freezeWithSigner(signer);

        const signedTx = await transferTx.signWithSigner(signer);
        const txResponse = await signedTx.executeWithSigner(signer);
        const receipt = await provider.getTransactionReceipt(txResponse.transactionId);

        console.log(`- Transaction status: ${receipt.status.toString()}`);
        return receipt.status.toString();
    } catch (error) {
        console.error("- Error during HBAR transfer:", error);
        throw new Error(`HBAR transfer failed: ${error.message}`);
    }
}