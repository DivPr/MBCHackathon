"use client";

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  Name,
  Identity,
} from "@coinbase/onchainkit/identity";
import { useState, useEffect } from "react";

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="btn-secondary py-2 px-6 opacity-50" disabled>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading
        </span>
      </button>
    );
  }

  return (
    <Wallet>
      <ConnectWallet
        withWalletAggregator={true}
        className="!bg-gradient-to-r !from-stride-purple !to-stride-violet !text-white !font-semibold !py-2.5 !px-5 !rounded-xl hover:!opacity-90 !transition-all !shadow-lg !shadow-stride-purple/25 !border-0"
      >
        <Avatar className="h-6 w-6" />
        <Name className="!text-white" />
      </ConnectWallet>
      <WalletDropdown className="!bg-stride-gray !border !border-white/10 !rounded-xl !shadow-2xl">
        <Identity
          className="!px-4 !pt-3 !pb-2"
          hasCopyAddressOnClick={true}
        >
          <Avatar />
          <Name className="!text-white !font-medium" />
          <Address className="!text-stride-muted !font-mono !text-sm" />
        </Identity>
        <WalletDropdownDisconnect className="!text-red-400 hover:!bg-red-500/10 !rounded-lg !mx-2 !mb-2" />
      </WalletDropdown>
    </Wallet>
  );
}
