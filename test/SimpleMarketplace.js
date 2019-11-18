const SimpleMarketplace = artifacts.require('SimpleMarketplace');
const truffleAssert = require('truffle-assertions');

contract('SimpleMarketplace', (accounts) => {
    let contract;
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const owner = accounts[0];
    const buyer = accounts[1];

    describe('Constructor', () => {
        beforeEach('setup', async () => {
            contract = await SimpleMarketplace.new('testdescription', 1);
        });

        it('should return a new instance of the contract', async () => {
            var description = await contract.Description();
            var askingPrice = await contract.AskingPrice();
            assert.equal(description, 'testdescription', 'Default description not set to proper value.');
            assert.equal(askingPrice, 1, 'Asking price was not set to the expected value of 1.');
        });
    })

    describe('MakeOffer', () => {
        beforeEach('setup', async () => {
            contract = await SimpleMarketplace.new('testdescription', 1);
        });

        it('offer price cannot be zero', async () => {
            await truffleAssert.reverts(contract.MakeOffer(0, { from: buyer }));
        });

        it('state should only be ItemAvailable', async () => {
            // state is not ItemAvailable after the following statement
            await contract.MakeOffer(1, { from: buyer });

            await truffleAssert.reverts(contract.MakeOffer(1, { from: buyer }));
        });

        it('owner cannot make an offer', async () => {
            await truffleAssert.reverts(contract.MakeOffer(1, { from: owner }));
        });

        it('should update the contract', async () => {
            var result = await contract.MakeOffer(1, { from: buyer });
            var state = await contract.State();
            var offerPrice = await contract.AskingPrice();
            var actualBuyer = await contract.InstanceBuyer();

            assert.equal(1, state, 'state was not set to OfferPlaced');
            assert.equal(1, offerPrice, 'offer price was not properly set.')
            assert.equal(buyer, actualBuyer, 'buyer was not properly set.')
            truffleAssert.eventEmitted(result, 'ContractUpdated', (ev) => {
                return ev.action == 'MakeOffer';
            }, 'Contract should return the correct message');
        });
    })

    describe('AcceptOffer', () => {
        beforeEach('setup', async () => {
            contract = await SimpleMarketplace.new('testdescription', 1);
            await contract.MakeOffer(1, { from: buyer });
        });

        it('no one other than owner can accept the offer', async () => {
            await truffleAssert.reverts(contract.AcceptOffer({ from: buyer }));
        });

        it('should update the contract', async () => {
            var result = await contract.AcceptOffer({ from: owner });
            var state = await contract.State();

            assert.equal(2, state, 'state was not set to Accepted');
            truffleAssert.eventEmitted(result, 'ContractUpdated', (ev) => {
                return ev.action == 'AcceptOffer';
            }, 'Contract should return the correct message');
        });
    })

    describe('Reject', () => {
        beforeEach('setup', async () => {
            contract = await SimpleMarketplace.new('testdescription', 1);
            await contract.MakeOffer(1, { from: buyer });
        });

        it('state must be OfferPlaced', async () => {
            // state is not OfferPlaced after the following statement
            await contract.AcceptOffer({ from: owner });

            await truffleAssert.reverts(contract.Reject({ from: owner }));
        });

        it('only owner can reject', async () => {
            await truffleAssert.reverts(contract.Reject({ from: buyer }));
        });

        it('should update contract', async () => {
            var result = await contract.Reject({ from: owner });
            var state = await contract.State();
            var instanceBuyer = await contract.InstanceBuyer();

            assert.equal(0, state);
            assert.equal(zeroAddress, instanceBuyer);
            truffleAssert.eventEmitted(result, 'ContractUpdated', (ev) => {
                return ev.action == 'Reject';
            }, 'Contract should return the correct message');
        });
    })
})
