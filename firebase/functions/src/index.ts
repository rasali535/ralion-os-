import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Mari AI RAG Vector Processing Function
export const processMariRagVector = functions.firestore
  .document('organizations/{orgId}/knowledge/{docId}')
  .onCreate(async (snap, context) => {
    const docData = snap.data();
    const { orgId, docId } = context.params;

    console.log(`[Mari AI RAG] Processing knowledge vector chunking for org ${orgId}, doc ${docId}`);
    
    // Simulate chunking and vector index update
    await snap.ref.update({
      vectorIndexed: true,
      chunkCount: Math.ceil((docData.content || '').length / 500),
      indexedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

// Visual Workflow Automation Trigger Runner
export const executeWorkflowTrigger = functions.firestore
  .document('organizations/{orgId}/contacts/{contactId}')
  .onCreate(async (snap, context) => {
    const contactData = snap.data();
    const { orgId } = context.params;

    console.log(`[Ralion Workflow Engine] Trigger: NEW_CUSTOMER for org ${orgId}`);

    // Query active workflow rules for NEW_CUSTOMER
    const rulesSnap = await admin.firestore()
      .collection('organizations')
      .doc(orgId)
      .collection('workflows')
      .where('isActive', '==', true)
      .where('trigger.event', '==', 'NEW_CUSTOMER')
      .get();

    rulesSnap.forEach(async (ruleDoc) => {
      const rule = ruleDoc.data();
      console.log(`Executing actions for rule: ${rule.name}`);
      
      // Increment execution counter
      await ruleDoc.ref.update({
        executionCount: admin.firestore.FieldValue.increment(1)
      });
    });
  });

// Botswana & Stripe Billing Webhook Receiver
export const handleBillingWebhook = functions.https.onRequest(async (req, res) => {
  const event = req.body;
  console.log('[Ralion Billing] Received payment webhook event:', event?.type);
  res.status(200).send({ received: true });
});
