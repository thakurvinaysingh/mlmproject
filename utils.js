const { User } = require('./models/user');
const { Package } = require('./models/package');
const cron = require('node-cron');

//--- logic of package...

async function calculateAndAddDailyBenefits(userId) {
    
    try {
        const user = await User.findById(userId).populate('packages.packageId');
        
        if (!user) {
            console.log('User not found');
            return;
        }

        if (user.status !== 'active') {
            console.log('User is not active.');
            return;
        }

        const today = new Date();
        let totalBenefit = 0;
        // Check if user has purchased a package
        if (user.packages && user.packages.length > 0) {
            const pkg = user.packages[0];
            const secondsSincePurchase = Math.floor((today - new Date(pkg.purchasedAt)) / 1000);
            const packageDetails = pkg.packageId;

            console.log('Package Details:', packageDetails);

            // Ensure packageDetails has duration field
            if (!packageDetails || !packageDetails.duration) {
                console.error('Package details are missing or do not have duration');
                return;
            }

            // Convert duration to seconds
            const durationSeconds = packageDetails.duration * 60;
            console.log('Duration time', durationSeconds);

            if (secondsSincePurchase < durationSeconds) {
                totalBenefit = packageDetails.amount * (packageDetails.percentage / 100);
            }
        }
        
          //-------multiple users buy package---------------//
        // user.packages.forEach(pkg => {
        //     const secondsSincePurchase = Math.floor((today - new Date(pkg.purchasedAt)) / 1000); // Calculate seconds
        //     const packageDetails = pkg.packageId;
           

        //     console.log('Package Details:', packageDetails);

        //     // Ensure packageDetails has durationDays field
        //     if (!packageDetails || !packageDetails.duration) {
        //         console.error('Package details are missing or do not have durationDays');
        //         return;
        //     }
        //     // Convert durationDays to seconds for testing
        //     const durationSeconds = packageDetails.duration * 60
        //     console.log('duration time', durationSeconds);
        //     if (secondsSincePurchase < durationSeconds) {
        //         totalBenefit += packageDetails.amount * (packageDetails.percentage / 100);
        //     }
       // });

        
        user.wallet += totalBenefit;
        await user.save();

        console.log(`Calculated and added ${totalBenefit} to wallet. New wallet balance: ${user.wallet}`);
        return { dailyBenefit: totalBenefit, wallet: user.wallet };
    } catch (err) {
        console.error('Server error:', err); // Log the error for debugging
    }
}

// Schedule the job to run every 3 seconds for testing
cron.schedule(' 0 0 * * *', async () => {
    console.log('Running daily benefits calculation...');

    try {
        // Find all users with active status
        const users = await User.find({ status: 'active' });

        for (const user of users) {
            await calculateAndAddDailyBenefits(user._id);
        }

        console.log('Daily benefits calculation completed.');
    } catch (err) {
        console.error('Error during daily benefits calculation:', err);
    }
});

//-------------------------new user ----BFS process----------------//



// async function addUser(adminId, newUser) {
//     const queue = [adminId];
//     let currentLevel = 0;

//     while (queue.length) {
//         const userId = queue.shift();
//         const user = await User.findById(userId);

//         if (!user.leftChild) {
//             newUser.level = user.level + 1;
//             newUser.parent = user._id;
//             const createdUser = await User.create(newUser);
//             user.leftChild = createdUser._id;
//             await user.save();
//             return createdUser;
//         } else {
//             queue.push(user.leftChild);
//         }

//         if (!user.rightChild) {
//             newUser.level = user.level + 1;
//             newUser.parent = user._id;
//             const createdUser = await User.create(newUser);
//             user.rightChild = createdUser._id;
//             await user.save();
//             return createdUser;
//         } else {
//             queue.push(user.rightChild);
//         }

//         currentLevel = user.level + 1;
//     }
// }


// --------------------------new user----------------------------// 

async function addUser(adminId, newUser, method ) {
    if (method === 'Any') {
        console.log('Using BFS approach');
        return await addUserBFS(adminId, newUser);
    } else if (method === 'Left') {
        console.log('Using DFS approach (Left)');
        return await addUserDFSLeft(adminId, newUser);
    } else if (method === 'Right') {
        console.log('Using DFS approach (Right)');
        return await addUserDFSRight(adminId, newUser);
    } else {
        throw new Error('Invalid method specified. Use "BFS", "Left", or "Right".');
    }
}


async function addUserBFS(adminId, newUser) {
    const queue = [adminId]; // Initialize the queue with the root adminId
    const MAX_LEVEL = 5;

    while (queue.length > 0) {
        const userId = queue.shift(); // Dequeue the next user ID
        try {
            console.log(`Finding user with ID: ${userId}`);
            const user = await User.findById(userId);
            console.log(`User found: ${user ? user.name : 'No user found'}`);
            // reset tghe level 
            let currentLevel = user.level + 1;
            if (currentLevel > MAX_LEVEL) {
                console.log(`Reached max level ${MAX_LEVEL}, resetting to level 1`);
                nextLevel = 1;
            }

            if (!user.leftChild) {
                console.log('Adding new user as leftChild');
                newUser.level = currentLevel;
                newUser.parent = user._id;
                const createdUser = await User.create(newUser);
                user.leftChild = createdUser._id;
                await user.save();
                console.log('User created and leftChild assigned');
                return createdUser;
            } else if (!user.rightChild) {
                console.log('Adding new user as rightChild');
                newUser.level = currentLevel;
                newUser.parent = user._id;
                const createdUser = await User.create(newUser);
                user.rightChild = createdUser._id;
                await user.save();
                console.log('User created and rightChild assigned');
                return createdUser;
            } else {
                // Enqueue the left and right children if they exist
                if (user.leftChild) queue.push(user.leftChild);
                if (user.rightChild) queue.push(user.rightChild);
            }
        } catch (error) {
            console.error(`Error in addUserBFS: ${error.message}`);
            throw error;
        }
    }

    console.log('No available position found in the tree.');
    return null;
}

async function addUserDFSLeft(adminId, newUser) {
    const MAX_LEVEL = 5; 

    const addNode = async (userId, currentLevel = 1) => {
        try {
            console.log(`Finding user with ID: ${userId}`);
            const user = await User.findById(userId);
            console.log(`User found: ${user ? user.name : 'No user found'}`);

            if (currentLevel > MAX_LEVEL) {
                console.log(`Reached max level ${MAX_LEVEL}, resetting to level 1`);
                currentLevel = 1;
            }

            if (!user.leftChild) {
                console.log('Adding new user as leftChild');
                newUser.level = currentLevel
                newUser.parent = user._id;
                const createdUser = await User.create(newUser);
                user.leftChild = createdUser._id;
                await user.save();
                console.log('User created and leftChild assigned');
                return createdUser;
            } else if (!user.rightChild) {
                console.log('Adding new user as rightChild');
                newUser.level = currentLevel
                newUser.parent = user._id;
                const createdUser = await User.create(newUser);
                user.rightChild = createdUser._id;
                await user.save();
                console.log('User created and rightChild assigned');
                return createdUser;
            } else {
                console.log('Traversing to leftChild');
                const leftChild = await addNode(user.leftChild);
                if (leftChild) return leftChild;
                console.log('Traversing to rightChild');
                return await addNode(user.rightChild);
            }
        } catch (error) {
            console.error(`Error in addNode: ${error.message}`);
            throw error; // Rethrow the error to be caught by the calling function
        }
    };

    try {
        console.log(`Starting addUserDFS with adminId: ${adminId}`);
        return await addNode(adminId);
    } catch (error) {
        console.error(`Error in addUserDFS: ${error.message}`);
        throw error;
    }
}


async function addUserDFSRight(adminId, newUser) {
    const MAX_LEVEL = 5;

    const addNode = async (userId, currentLevel=1) => {
        try {
            console.log(`Finding user with ID: ${userId}`);
            const user = await User.findById(userId);
            console.log(`User found: ${user ? user.name : 'No user found'}`);

            if (currentLevel > MAX_LEVEL) {
                console.log(`Reached max level ${MAX_LEVEL}, resetting to level 1`);
                currentLevel = 1;
            }

            if (!user.rightChild) {
                console.log('Adding new user as rightChild');
                newUser.level = currentLevel;
                newUser.parent = user._id;
                const createdUser = await User.create(newUser);
                user.rightChild = createdUser._id;
                await user.save();
                console.log('User created and rightChild assigned');
                return createdUser;
            } else if (!user.leftChild) {
                console.log('Adding new user as leftChild');
                newUser.level = currentLevel;
                newUser.parent = user._id;
                const createdUser = await User.create(newUser);
                user.leftChild = createdUser._id;
                await user.save();
                console.log('User created and leftChild assigned');
                return createdUser;
            } else {
                console.log('Traversing to rightChild');
                const rightChild = await addNode(user.rightChild);
                if (rightChild) return rightChild;
                console.log('Traversing to leftChild');
                return await addNode(user.leftChild);
            }
        } catch (error) {
            console.error(`Error in addNode: ${error.message}`);
            throw error;
        }
    };

    try {
        console.log(`Starting addUserDFS with adminId: ${adminId}`);
        return await addNode(adminId);
    } catch (error) {
        console.error(`Error in addUserDFS: ${error.message}`);
        throw error;
    }
}
//-----------------------end---------------------------------//

//------------------------commission Rate-------------------//
async function checkAndDistributeCommission(user) {
    // Check if both children exist, meaning the level is completed
    if (user.leftChild && user.rightChild) {
        console.log(`Level completed for user ${user.name}. Distributing commissions.`);
        await distributeCommissions(user._id);
    }
}

async function distributeCommissions(userId) {
    const commissionRates = [0.08, 0.05, 0.03, 0.02, 0.01]; // Rates for levels 1 to 5
    let currentUser = await User.findById(userId);
    let currentLevel = 0;

    while (currentUser && currentLevel < commissionRates.length) {
          const parent = await User.findById(currentUser.parent);

        if  (parent && parent.leftChild && parent.rightChild) { // Only give commission if both children are active
            const commission = currentUser.packages.packageId.amount * commissionRates[currentLevel];
            parent.walletBalance += commission;
            await parent.save();
            console.log(`Commission of ${commission} added to ${parent.name} at level ${currentLevel + 1}`);
        }

        currentUser = parent;
        currentLevel++;
    }
}



module.exports = { calculateAndAddDailyBenefits, addUser };
