var SimpleMarketplace = artifacts.require('SimpleMarketplace');

module.exports = (deployer) => {
    deployer.deploy(SimpleMarketplace, 'testdescription', 1);
}