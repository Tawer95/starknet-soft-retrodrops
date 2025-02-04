import { createLoggerInstance } from './logger.js';
import ModuleConfig from '../utils/getCfgSetting.js'; 
import ActivateMainModules from './activateModules.js';
import helpersFunctions from './helpersClass.js';


export default class Workers {
    constructor(mmKey, starkKeys, okecx, addressIndex,StarknetOkx) {
        this.mmKey = mmKey;
        this.starkKeys = starkKeys;
        this.okecx = okecx;
        this.addressIndex = addressIndex;
        this.getConfig = new ModuleConfig();
        this.helpersFunctions = new helpersFunctions()
        this.ActivateMainModules = new ActivateMainModules()
        this.StarknetOkx = StarknetOkx
    }

    async execute() {
        try {
            const logger = createLoggerInstance(this.addressIndex);

            const configOKX = this.getConfig.getConfigOKX();
            const configBridge = this.getConfig.getBridgeConfig();
            const addressesAndKeys = await this.helpersFunctions.getETHAndStarkAddresses(this.mmKey,this.starkKeys)

            await this.ActivateMainModules.withdrawalFromOkxToWallet(configOKX,configBridge,addressesAndKeys,logger,this.addressIndex)
            
            await this.ActivateMainModules.BridgeToStark(configBridge,addressesAndKeys,logger,this.addressIndex)
            
            
            await this.ActivateMainModules.startDexModules(addressesAndKeys.startPrivateKey,logger,this.addressIndex)
            
            await this.ActivateMainModules.BridgeFromStark(configBridge,addressesAndKeys,logger,this.addressIndex)

            await this.ActivateMainModules.withdrawalFromWalletToOkx(configOKX,configBridge,addressesAndKeys,logger,this.okecx,this.addressIndex,this.StarknetOkx)

        } catch (error) {
            console.error(`[Account ${this.addressIndex}] Возникла ошибка при выполнении ${error.message}, поток остановлен:`, error.stack);
        }
    }
}

