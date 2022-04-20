import { Box, Button, Spinner, Text, useToast } from "@chakra-ui/react";
import { ChevronRightIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import * as B from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faWallet, faArrowUp, faBox, faCirclePlus, faAnchor, faAtlas, faSigning, faCreditCard } from '@fortawesome/free-solid-svg-icons'

import React, { useEffect, useState } from 'react';
import './App.css';

import NamiJs, { Buffer } from './nami-js';
let nami;

export default function App() {
    const toast = useToast();
    const [connected, setConnected] = React.useState("");
    const [loading, setLoading] = useState(false)

    const [attributes, setAttributes] = useState(["nft_name", "ipfs_hash"])
    const [values, setValues] = useState({
        "nft_name": "FuixlabsNFT",
        "ipfs_hash": "QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
    })
    const [newAttribute, setNewAttribute] = useState("")

    const init = async () => {
        nami = new NamiJs(
            "https://cardano-testnet.blockfrost.io/api/v0",
            "testnet6jcGJsH50cLoJs84BRtcmciI5dmjFYLy"
        );
    };

    useEffect(() => {
        init();
    }, [])

    useEffect(() => {
        if (connected) {
            window.cardano.onAccountChange(async () => {
                const address = await nami.baseAddressToBech32();
                setConnected(address);
            });
        }
    }, [])

    const connect = async () => {
        if (
            !(
                NoNami(toast) &&
                (await window.cardano.enable()) &&
                (await WrongNetworkToast(toast))
            )
        ) {
            return;
        }
        const address = await nami.baseAddressToBech32();
        setConnected(address);
    }

    const buildRawTransaction = async () => {
        setLoading(true);
        const _policy = await nami.createLockingPolicyScript();
        setPolicy(_policy);
        const _metadata = {
            [_policy.id]: {
                [values["nft_name"]]: {
                    name: values["nft_name"],
                    image: `ipfs://${values["ipfs_hash"]}`,
                },
            },
        };
        for (const attribute of attributes) {
            if (typeof values[attribute] === "undefined") {
                continue;
            }
            if (attribute === "nft_name" || attribute === "ipfs_hash") {
                continue;
            }
            _metadata[_policy.id][values["nft_name"]][attribute] = values[attribute];
        }
        setMetadata(_metadata);
        const _tx = await nami
            .mintTx(
                [{ name: values["nft_name"], quantity: "1" }],
                _metadata,
                _policy
            )
            .catch((e) => {
                console.log(e);
                FailedTransactionToast(toast);
                setLoading(false);
            });
        if (!_tx) return;
        setLoading(false);
        setTx(_tx);
        setRawTx({
            "type": "TxBodyAlonzo",
            "description": "",
            "cborHex": `${Buffer.from(_tx.to_bytes(), "hex").toString("hex")}`,
        });
    }

    const [policy, setPolicy] = useState()
    const [metadata, setMetadata] = useState()
    const [tx, setTx] = useState()
    const [rawTx, setRawTx] = useState("")
    const [successTxHash, setSuccessTxHash] = useState("")

    const makeTransaction = async () => {
        setLoading(true);
        console.log("policy:", policy);
        fetch(`https://pool.pm/register/policy/${policy.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "all",
                scripts: [
                    {
                        keyHash: policy.paymentKeyHash,
                        type: "sig",
                    },
                    { slot: policy.ttl, type: "before" },
                ],
            }),
        }).then((res) => res.json()).then(console.log);
        console.log("metadata", metadata);
        console.log("tx:", tx);
        const signedTx = await nami.signTx(tx).catch(() => setLoading(false));
        if (!signedTx) return;
        console.log("signedTx:", signedTx);
        const txHash = await nami.submitTx(signedTx);
        PendingTransactionToast(toast);
        await nami.awaitConfirmation(txHash);
        toast.closeAll();
        SuccessTransactionToast(toast, txHash);
        setLoading(false);
        console.log("txHash:", txHash);
        setSuccessTxHash(txHash);
    };

    const handle = (e) => {
        if (e.target.name === "new_attribute") {
            setNewAttribute(e.target.value)
        } else {
            setValues({
                ...values,
                [e.target.name]: e.target.value
            });
        }
    }

    const addAttribute = () => {
        if (newAttribute.length > 0) {
            setAttributes([...attributes, newAttribute])
            setNewAttribute('')
        }
    }

    const deleteAttribte = (attribute) => {
        if (attribute === "nft_name" || attribute === "ipsf_hash") {
            throw new Error("Cannot delete nft_name or ipsf_hash.");
        }
        setAttributes(attributes.filter(a => a !== attribute))
    }

    return (
        <div>
            <B.Navbar bg="light" expand="lg">
                <B.Container fluid>
                    <B.Navbar.Brand href="/">Fuixlabs Minter</B.Navbar.Brand>
                </B.Container>
            </B.Navbar>
            <B.Container fluid>
                <div className='row'>
                    <div className='col-md-12' style={{
                        marginBottom: '20px',
                    }}>
                        <div className='row'>
                            <div className='col-md-12 mb-3'>
                                <B.Badge bg='success' className='pt-2 pb-2 mb-3'>{connected ? `Your address:  ${connected}` : null}</B.Badge>
                                <B.ListGroup horizontal>
                                    {
                                        attributes.map((attr, id) => (
                                            <B.ListGroup.Item key={id}>
                                                {attr} &nbsp;
                                                <FontAwesomeIcon onClick={() => deleteAttribte(attr)} icon={faTrash}></FontAwesomeIcon>
                                            </B.ListGroup.Item>
                                        ))
                                    }
                                </B.ListGroup>
                            </div>
                            <div className='col-md-3'>
                                <B.InputGroup>
                                    <B.FormControl type="text" placeholder="new_attribute" name="new_attribute" onChange={handle} value={newAttribute} />
                                    <B.Button variant='secondary' onClick={addAttribute}>
                                        <FontAwesomeIcon icon={faCirclePlus}></FontAwesomeIcon>
                                    </B.Button>
                                </B.InputGroup>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <B.Table responsive striped bordered hover>
                            <thead>
                                <tr>
                                    {
                                        attributes.map((attr, id) => (
                                            <th key={id}>
                                                {attr}
                                            </th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {
                                        attributes.map((attr, id) => (
                                            <th key={id}>
                                                <input onChange={handle} name={attr} value={values[attr] || ''} className='form-control' placeholder={attr}></input>
                                            </th>
                                        ))
                                    }
                                </tr>
                            </tbody>
                        </B.Table>
                    </div>
                    <div className='col-md-12'>
                        <B.Form hidden={!tx}>
                            <B.Form.Group className="mb-3">
                                <B.Form.Label>Raw transaction</B.Form.Label>
                                <B.Form.Control readOnly as="textarea" value={JSON.stringify(rawTx, null, 4)} rows={5} />
                            </B.Form.Group>
                        </B.Form>
                    </div>
                    <div className='col-md-12'>
                        <B.ButtonGroup>
                            <B.Button variant={`${connected ? "secondary" : "danger"}`} onClick={() => connect()}>
                                <FontAwesomeIcon icon={faWallet}></FontAwesomeIcon> &nbsp;
                                Connect wallet
                            </B.Button>
                            <B.Button variant={`${tx ? "secondary" : "primary"}`} onClick={() => buildRawTransaction()}>
                                <FontAwesomeIcon icon={faCreditCard}></FontAwesomeIcon> &nbsp;
                                Build raw transaction
                            </B.Button>
                            <B.Button variant={`${successTxHash ? "secondary" : "success"}`} onClick={() => makeTransaction()}>
                                <FontAwesomeIcon icon={faArrowUp}></FontAwesomeIcon> &nbsp;
                                Submit transaction
                            </B.Button>
                        </B.ButtonGroup>
                    </div>
                </div>
            </B.Container>
        </div>
    );
}

const checkStatus = async (toast, connected) => {
    return (
        NoNami(toast) &&
        (await NotConnectedToast(toast, connected)) &&
        (await WrongNetworkToast(toast))
    );
};

const NoNami = (toast) => {
    if (window.cardano) return true;
    toast({
        position: "bottom-right",
        title: (
            <Box width="full" display="flex">
                <Text>Nami not installed</Text>z
                <Button
                    onClick={() => window.open("https://namiwallet.io")}
                    ml="6"
                    mr="-4"
                    size="xs"
                    background="white"
                    color="orange.400"
                    rightIcon={<ChevronRightIcon />}
                >
                    Get it
                </Button>
            </Box>
        ),
        status: "warning",
        duration: 9000,
    });
    return false;
};

const WrongNetworkToast = async (toast) => {
    console.log("networdId:", await window.cardano.getNetworkId());
    if ((await window.cardano.getNetworkId()) === 0) return true;
    toast({
        position: "bottom-right",
        title: "Wrong network",
        status: "info",
        duration: 5000,
    });
    return false;
};

const NotConnectedToast = async (toast, connected) => {
    if (connected) return true;
    toast({
        position: "bottom-right",
        title: "Connect the wallet first",
        status: "info",
        duration: 5000,
    });
    return false;
};

const FailedTransactionToast = (toast) => {
    return toast({
        position: "bottom-right",
        title: "Transaction not possible",
        description: "(Maybe insufficient balance)",
        status: "error",
        duration: 5000,
        isClosable: true,
    });
};

const PendingTransactionToast = (toast) => {
    toast({
        position: "bottom-right",
        title: (
            <Box display="flex" alignItems="center">
                <Text>Transaction pending</Text>
                <Spinner ml="4" speed="0.5s" size="md" />
            </Box>
        ),
        status: "info",
        duration: null,
    });
};

const SuccessTransactionToast = (toast, txHash) => {
    toast({
        position: "bottom-right",
        title: (
            <Box display="flex" alignItems="center">
                <Text>Transaction confirmed</Text>
                <ExternalLinkIcon
                    cursor="pointer"
                    ml="4"
                    onClick={() =>
                        window.open(`https://cardanoscan.io/transaction/${txHash}`)
                    }
                />
            </Box>
        ),
        status: "success",
        duration: 9000,
    });
};