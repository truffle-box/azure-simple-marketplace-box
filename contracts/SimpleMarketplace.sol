pragma solidity ^0.5.0;

contract SimpleMarketplace {

    enum StateType {
      ItemAvailable,
      OfferPlaced,
      Accepted
    }

    string internal ApplicationName = "SimpleMarketplace";
    string internal WorkflowName = "SimpleMarketplace";

    event ContractCreated(string applicationName, string workflowName, address originatingAddress);
    event ContractUpdated(string applicationName, string workflowName, string action, address originatingAddress);

    address public InstanceOwner;
    string public Description;
    uint public AskingPrice;
    StateType public State;

    address public InstanceBuyer;
    int public OfferPrice;

    constructor (string memory description, uint256 price) public {
        InstanceOwner = msg.sender;
        AskingPrice = price;
        Description = description;
        State = StateType.ItemAvailable;

        emit ContractCreated(ApplicationName, WorkflowName, msg.sender);
    }

    function MakeOffer(int offerPrice) public {
        if (offerPrice == 0) {
            revert("MakeOffer function needs to have an offerPrice > 0");
        }

        if (State != StateType.ItemAvailable) {
            revert("MakeOffer function can only be called when at ItemAvailable state");
        }

        if (InstanceOwner == msg.sender) {
            revert("MakeOffer function cannot be called by the owner");
        }

        InstanceBuyer = msg.sender;
        OfferPrice = offerPrice;
        State = StateType.OfferPlaced;

        emit ContractUpdated(ApplicationName, WorkflowName, "MakeOffer", msg.sender);
    }

    function Reject() public {
        if (State != StateType.OfferPlaced) {
            revert("Reject function can only be called when in OfferPlaced state");
        }

        if (InstanceOwner != msg.sender) {
            revert("Reject function can only be called by the owner");
        }

        InstanceBuyer = address(0x0);
        State = StateType.ItemAvailable;

        emit ContractUpdated(ApplicationName, WorkflowName, "Reject", msg.sender);
    }

    function AcceptOffer() public {
        if (InstanceOwner != msg.sender) {
            revert("AcceptOffer function can only be called by the owner");
        }

        State = StateType.Accepted;

        emit ContractUpdated(ApplicationName, WorkflowName, "AcceptOffer", msg.sender);
    }
}
