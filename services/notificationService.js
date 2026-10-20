const Notification = require('../models/Notification');
const User = require('../models/User');
const LostItem = require('../models/LostItem');
const { sendToUser, broadcastToAll, broadcastToAdmins } = require('./socketService');

/**
 * Create a single notification and send real-time socket event
 */
const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = '/',
  relatedItem = null,
  itemType = null,
  relatedClaim = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      relatedItem,
      itemType,
      relatedClaim,
    });

    // Send real-time notification to user
    sendToUser(recipient, {
      type: 'notification',
      data: notification,
    });

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

/**
 * Broadcast notification when someone publishes a Lost Item
 */
const notifyNewLostItemPublished = async (lostItem, publisherUser) => {
  try {
    const title = `📢 Lost Item Alert: ${lostItem.itemName}`;
    const message = `Lost at ${lostItem.location} (${lostItem.category}). Help locate it!`;
    const link = `/?search=${encodeURIComponent(lostItem.itemName)}`;

    // Get all users except publisher
    const otherUsers = await User.find({ _id: { $ne: publisherUser._id } }).select('_id');

    if (otherUsers.length > 0) {
      const notifications = otherUsers.map((u) => ({
        recipient: u._id,
        sender: publisherUser._id,
        type: 'item_lost_broadcast',
        title,
        message,
        link,
        relatedItem: lostItem._id,
        itemType: 'LostItem',
        isRead: false,
      }));

      await Notification.insertMany(notifications);
    }

    // Broadcast real-time alert to all connected users except the publisher
    broadcastToAll(
      {
        type: 'broadcast_alert',
        data: {
          type: 'item_lost_broadcast',
          title,
          message,
          link,
          relatedItem: lostItem._id,
          itemType: 'LostItem',
          createdAt: new Date(),
        },
      },
      publisherUser._id
    );
  } catch (err) {
    console.error('Error broadcasting lost item notification:', err);
  }
};

/**
 * Broadcast notification when someone publishes a Found Item + Smart match alert
 */
const notifyNewFoundItemPublished = async (foundItem, publisherUser) => {
  try {
    const title = `✨ Found Item Alert: ${foundItem.itemName}`;
    const message = `Found at ${foundItem.foundLocation} (${foundItem.category}). Check if it's yours!`;
    const link = `/?search=${encodeURIComponent(foundItem.itemName)}`;

    // 1. Broadcast to everyone
    const otherUsers = await User.find({ _id: { $ne: publisherUser._id } }).select('_id');

    if (otherUsers.length > 0) {
      const notifications = otherUsers.map((u) => ({
        recipient: u._id,
        sender: publisherUser._id,
        type: 'item_found_broadcast',
        title,
        message,
        link,
        relatedItem: foundItem._id,
        itemType: 'FoundItem',
        isRead: false,
      }));

      await Notification.insertMany(notifications);
    }

    broadcastToAll(
      {
        type: 'broadcast_alert',
        data: {
          type: 'item_found_broadcast',
          title,
          message,
          link,
          relatedItem: foundItem._id,
          itemType: 'FoundItem',
          createdAt: new Date(),
        },
      },
      publisherUser._id
    );

    // 2. Smart Match Check: Find active lost items in same category or matching keywords
    const potentialLostMatches = await LostItem.find({
      status: 'active',
      ownerId: { $ne: publisherUser._id },
      category: foundItem.category,
    }).populate('ownerId', 'name');

    const foundWords = foundItem.itemName.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const foundDescWords = (foundItem.description || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3);

    for (const lost of potentialLostMatches) {
      // Check if names or descriptions match specifically
      const lostWords = lost.itemName.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const lostDescWords = (lost.description || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3);

      const hasTitleOverlap = lostWords.some((w) => foundWords.includes(w) || foundItem.itemName.toLowerCase().includes(w));
      const hasFoundOverlap = foundWords.some((w) => lostWords.includes(w) || lost.itemName.toLowerCase().includes(w));
      const hasDescOverlap = lostDescWords.length > 0 && lostDescWords.some((w) => foundDescWords.includes(w));

      if (hasTitleOverlap || hasFoundOverlap || hasDescOverlap) {
        await createNotification({
          recipient: lost.ownerId._id,
          sender: publisherUser._id,
          type: 'item_matched',
          title: `🔍 Possible Match Found for "${lost.itemName}"!`,
          message: `A "${foundItem.itemName}" was found at ${foundItem.foundLocation}. Click to check!`,
          link: `/?search=${encodeURIComponent(foundItem.itemName)}`,
          relatedItem: foundItem._id,
          itemType: 'FoundItem',
        });
      }
    }
  } catch (err) {
    console.error('Error broadcasting found item notification:', err);
  }
};

/**
 * Notify admins and item finder when a claim is submitted
 */
const notifyClaimSubmitted = async (claim, item, claimantUser) => {
  try {
    const itemName = item.itemName || 'item';

    // 1. Notify Admins
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    for (const admin of adminUsers) {
      await createNotification({
        recipient: admin._id,
        sender: claimantUser._id,
        type: 'claim_submitted',
        title: `📋 New Claim Submitted: ${itemName}`,
        message: `${claimantUser.name} (${claimantUser.studentId}) submitted a claim for "${itemName}".`,
        link: '/admin',
        relatedItem: item._id,
        itemType: claim.itemType,
        relatedClaim: claim._id,
      });
    }

    // 2. Notify Finder if it is a FoundItem reported by another student
    if (claim.itemType === 'FoundItem' && item.finderId) {
      const finderId = item.finderId._id || item.finderId;
      if (finderId.toString() !== claimantUser._id.toString()) {
        await createNotification({
          recipient: finderId,
          sender: claimantUser._id,
          type: 'claim_submitted',
          title: `👋 Claim Submitted for Found Item`,
          message: `A student submitted a claim for the item you found: "${itemName}". An admin is reviewing it.`,
          link: '/claims',
          relatedItem: item._id,
          itemType: 'FoundItem',
          relatedClaim: claim._id,
        });
      }
    }
  } catch (err) {
    console.error('Error sending claim submitted notification:', err);
  }
};

/**
 * Notify claimant when admin approves or rejects their claim
 */
const notifyClaimReviewed = async (claim, status, adminResponse, item) => {
  try {
    const itemName = item?.itemName || 'your item';
    const isApproved = status === 'approved';

    await createNotification({
      recipient: claim.userId,
      type: isApproved ? 'claim_approved' : 'claim_rejected',
      title: isApproved
        ? `🎉 Claim Approved: ${itemName}`
        : `❌ Claim Update: ${itemName}`,
      message: isApproved
        ? `Your claim for "${itemName}" has been approved! ${adminResponse ? `Note: "${adminResponse}"` : 'Please coordinate pickup.'}`
        : `Your claim for "${itemName}" was declined. ${adminResponse ? `Reason: "${adminResponse}"` : ''}`,
      link: '/claims',
      relatedItem: claim.itemId,
      itemType: claim.itemType,
      relatedClaim: claim._id,
    });
  } catch (err) {
    console.error('Error sending claim review notification:', err);
  }
};

/**
 * Notify user when item is marked as returned
 */
const notifyItemReturned = async (claim, item) => {
  try {
    const itemName = item?.itemName || 'Item';

    await createNotification({
      recipient: claim.userId,
      type: 'item_returned',
      title: `✅ Item Returned: ${itemName}`,
      message: `"${itemName}" has been officially marked as returned. Thank you for using CampusTrace!`,
      link: '/claims',
      relatedItem: claim.itemId,
      itemType: claim.itemType,
      relatedClaim: claim._id,
    });
  } catch (err) {
    console.error('Error sending item returned notification:', err);
  }
};

module.exports = {
  createNotification,
  notifyNewLostItemPublished,
  notifyNewFoundItemPublished,
  notifyClaimSubmitted,
  notifyClaimReviewed,
  notifyItemReturned,
};
