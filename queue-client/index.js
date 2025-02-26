const queue = require("oci-queue");
const core = require("oci-core");
const identity = require("oci-identity");
const common = require("oci-common");
const os = require("oci-objectstorage");
const loggingingestion = require("oci-loggingingestion");

// Use this in localhost
const provider = new common.ConfigFileAuthenticationDetailsProvider("~/.oci/config");

// Q settings
// Create a Connector Hub connector for OCI queue with the event-function
// See https://docs.oracle.com/en-us/iaas/Content/connector-hub/create-service-connector-queue-source.htm#top
 
// Your OCI Queue OCID and endpoint (usig FRA region)
const queueId = "ocid1.queue.oc1.eu-frankfurt-1.amaaaaaa...";
const endpoint = "https://cell-1.queue.messaging.eu-frankfurt-1.oci.oraclecloud.com";

const lClient = new loggingingestion.LoggingClient({ authenticationDetailsProvider: provider });

(async () => {
    var res = "";
    try {
        
        const statsReq = {
          queueId: queueId
        };

        const getReq = {
          queueId: queueId,
          timeoutInSeconds: 2
        };

        const client = new queue.QueueClient({
          authenticationDetailsProvider: provider
        });
        
        client.endpoint = endpoint;

        const d = new Date();
        console.log("Writing .. ");
        const putReq = {
          queueId: queueId,
          putMessagesDetails: { messages : [ { content: 'hello @ ' + d } ] }
        };
        
        const putRes = await client.putMessages(putReq);
        console.log(putRes);
        await writeLog("Queue write", "Queue write", 'hello @ ' + d);
        console.log("All done");
        
    } catch (error) {
        console.log("Error: " + error);
        res = "error";
    } finally {
        return res;
    }
}) ();

async function writeLog(subject, type, data)
{
  try {
        const putLogsDetails = {
          specversion: "1.0",
          logEntryBatches: [
            {
              entries: [
                {
                  id: subject,
                  data: data
                }
              ],
              source: "write to Q",
              type: type,
              subject: subject
            }
          ]
        };
        var putLogsRequest = loggingingestion.requests.PutLogsRequest = {
          // Create OCI Log and set the OCID here
          logId: "ocid1.log.oc1.eu-frankfurt-1.amaaaaaa..",
          putLogsDetails: putLogsDetails,
          timestampOpcAgentProcessing: new Date()
        };
        const putLogsResponse = await lClient.putLogs(putLogsRequest);
        console.log("Wrote to log succesfully");
  } catch (err) {
    console.error('Log error: ' + err.message);
  }
}

