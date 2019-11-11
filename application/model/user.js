const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

class User {
    create(user) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(user.key);
                if (userExists) {
                    console.log(`An identity for the user already exists in the wallet`);
                    return;
                }

                // Check to see if we've already enrolled the admin user.
                const adminExists = await wallet.exists('admin');
                if (!adminExists) {
                    console.log('An identity for the admin user "admin" does not exist in the wallet');
                    console.log('Run the enrollAdmin.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

                // Get the CA client object from the gateway for interacting with the CA.
                const ca = gateway.getClient().getCertificateAuthority();
                const adminIdentity = gateway.getCurrentIdentity();

                // Register the user, enroll the user, and import the new identity into the wallet.
                const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: user.key, role: 'client' }, adminIdentity);
                const enrollment = await ca.enroll({ enrollmentID: user, enrollmentSecret: secret });
                const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
                wallet.import(user, userIdentity);
                console.log(`Successfully registered and enrolled admin user and imported it into the wallet`);
                
                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Submit the specified transaction.
                await contract.submitTransaction('setUser', user.id.toString(), user.name.toString(), user.birth.toString(), user.gender.toString());
                console.log('Transaction has been submitted');

                // Disconnect from the gateway.
                await gateway.disconnect();
                resolve(`User ${user.id} successfully registered.`);
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new User();