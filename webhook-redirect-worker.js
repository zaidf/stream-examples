//This is an example of using a Cloudflare Worker script to redirect Stream's webhook requests to your prod or staging environment
//If the video's filename contains "staging-", it will pass the webhook data to the configured staging URL
//Data for any video that doesn't contain "staging-" will be sent to the prod endpoint

var environment_list = [];
environment_list["prod"] = "YOUR_PROD_URL";
environment_list["staging"] = "YOUR_STAGING_URL";

async function handleRequest(event) {

    var request = event.request
    const {
        headers
    } = request
    const contentType = headers.get("content-type") || ""
    var webhook_data;
    var json_data;
    var environment = "prod";
    if (contentType.includes("application/json")) {
        webhook_data = JSON.stringify(await request.json())
        json_data = await JSON.parse(webhook_data);
        if (json_data.meta.name.indexOf("staging-") != -1) {
            environment = "staging";
        }

    }
    const init = {
        method: "POST",
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },

        body: webhook_data
    }

    const response = await fetch(environment_list[environment], init)

    return new Response("sent data to " + environment_list[environment], {
        status: 200
    })
}

addEventListener("fetch", event => {
    return event.respondWith(handleRequest(event))
})
