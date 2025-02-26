const fdk=require('@fnproject/fdk');
const core = require("oci-core");
const common = require("oci-common");
const os = require("oci-objectstorage");
const loggingingestion = require("oci-loggingingestion");

fdk.handle(async function(event){
    var res = "ok";

    try {
        console.log("Running event function .. ");
        console.log(event);
        res = event;
        var data = "Queue read";
        if(event) data = event;
        await writeLog("Queue read", "Queue read", data);
        console.log("All done");
    } catch (error) {
        console.log("Error: " + error);
        res = error;
    } finally {
        return res;
    }
})

async function writeLog(subject, type, data)
{
    try {
            const provider = common.ResourcePrincipalAuthenticationDetailsProvider.builder();
            const lClient = new loggingingestion.LoggingClient({ authenticationDetailsProvider: provider });
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
                source: "Triggered by the Q",
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


