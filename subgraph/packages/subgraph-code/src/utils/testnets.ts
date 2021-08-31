import { Testnet } from "../../generated/schema";

export namespace testnets {

    export function loadTestnet(network: string): Testnet {
      let testnet = Testnet.load(network);
  
      if (testnet == null) {
        testnet = new Testnet(network);
        testnet.save();
      }
  
      return testnet as Testnet;
    }
  }