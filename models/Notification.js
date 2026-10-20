const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'item_lost_broadcast',
        'item_found_broadcast',
        'claim_submitted',
        'claim_approved',
        'claim_rejected',
        'item_matched',
        'item_returned',
        'system_alert',
      ],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    link: {
      type: String,
      default: '/',
      trim: true,
    },
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      refPath: 'itemType',
    },
    itemType: {
      type: String,
      enum: ['LostItem', 'FoundItem', null],
      default: null,
    },
    relatedClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for querying a user's notifications sorted by creation date
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
