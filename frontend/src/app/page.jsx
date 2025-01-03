"use client";

import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import "./styles/App.css";
import { signTx } from "./components/hedera/signTx.js";
import { writeOption } from "../api/actions.js";
import { WalletContext } from "./components/WalletProvider.jsx";
import ErrorScreen from "./components/ErrorScreen.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import SuccessPage from "./components/success-page.jsx";


export default function CreatePage() {
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [premium, setPremium] = useState("");
  const [strike, setStrike] = useState("");
  const [expiry, setExpiry] = useState("");
  const [optionType, setOptionType] = useState("call");
  const { accountId, walletData } = useContext(WalletContext);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Reset loading/error state when component mounts
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  async function createOption() {
    if (!walletData || !walletData.length || !accountId) {
      setError("Wallet is not connected. Please connect your wallet and try again.");
      return;
    }

    if (!token || !amount || !strike || !expiry) {
      setError("Please fill out all fields.");
      return;
    }

    const isCall = optionType === "call";

    setIsLoading(true); // Start loading
    setError(null); // Clear any previous error

    try {
      const writerNftSerial = await writeOption(
        accountId,
        token,
        amount,
        strike,
        isCall,
        premium,
        expiry
      );

      const hashconnect = walletData[0];
      const saveData = walletData[1];
      const provider = hashconnect.getProvider(
        "testnet",
        saveData.topic,
        accountId
      );
      const signer = hashconnect.getSigner(provider);

      await signTx(
        writerNftSerial.data.signedTx,
        signer,
        writerNftSerial.data.metadata,
        provider
      );

      // Clear input fields
      setToken("");
      setAmount("");
      setPremium("");
      setStrike("");
      setExpiry("");

      setIsSuccess(true); // Show success screen

    } catch (err) {
      setError(err.message || "Failed to create the option. Please try again.");

    } finally {
      setIsLoading(false); // Stop loading
    }
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (isSuccess) {
    return <SuccessPage message={`You have created an ${optionType} option for ${token} for ${amount} with strike price of ${strike} with a premium of ${premium} that expires on ${expiry}. View this NFT in your wallet.`} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Create New Option
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md mx-auto bg-gray-800 border-purple-500">
          <CardContent className="p-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token-id" className="text-white">
                  Token ID
                </Label>
                <Input
                  id="token-id"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter token ID"
                  className="bg-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium" className="text-white">
                  Premium
                </Label>
                <Input
                  id="premium"
                  type="number"
                  value={premium}
                  onChange={(e) => setPremium(e.target.value)}
                  placeholder="Enter premium"
                  className="bg-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strike-price" className="text-white">
                  Strike Price
                </Label>
                <Input
                  id="strike-price"
                  type="number"
                  value={strike}
                  onChange={(e) => setStrike(e.target.value)}
                  placeholder="Enter strike price"
                  className="bg-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry-date" className="text-white">
                  Expiry Date
                </Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="bg-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="option-type" className="text-white">
                  Option Type
                </Label>
                <Select onValueChange={(value) => setOptionType(value)} value={optionType}>
                  <SelectTrigger className="bg-gray-700 text-white">
                    <SelectValue placeholder="Select option type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="put">Put</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={createOption}
                type="button"
                className="w-full bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Create Option
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}