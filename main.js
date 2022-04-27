$(document).ready(function(){
    //do something
    $("#thisButton").click(function(){
        processImage();
    });
});

function processImage() {
    // **********************************************
    // *** Update or verify the following values. ***
    // **********************************************
    
    let endpoint = "Please Key in your endpoint url here";
    if (!subscriptionKey) { throw new Error('Set your environment variables for your subscription key and endpoint.'); }
    
    var uriBase = endpoint + "formrecognizer/v2.1/prebuilt/receipt/analyze";

    // Display the image.
    var sourceImageUrl = document.getElementById("inputImage").value;
    document.querySelector("#sourceImage").src = sourceImageUrl;

    // This operation requires two REST API calls. One to submit the image
    // for processing, the other to retrieve the text found in the image.
    //
    // Make the first REST API call to submit the image for processing.
    $.ajax({
        url: uriBase,

        // Request headers.
        beforeSend: function(jqXHR){
            jqXHR.setRequestHeader("Content-Type","application/json");
            jqXHR.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },

        type: "POST",

        // Request body.
        data: '{"source": ' + '"' + sourceImageUrl + '"}',
    })

    .done(function(data, textStatus, jqXHR) {
        // Show progress.
        $("#responseTextArea").val("Text submitted. " +
            "Waiting 10 seconds to retrieve the recognized text.");

        // Note: The response may not be immediately available. Text
        // recognition is an asynchronous operation that can take a variable
        // amount of time depending on the length of the text you want to
        // recognize. You may need to wait or retry the GET operation.
        //
        // Wait ten seconds before making the second REST API call.
        setTimeout(function () {
            // "Operation-Location" in the response contains the URI
            // to retrieve the recognized text.
            var operationLocation = jqXHR.getResponseHeader("Operation-Location");

            // Make the second REST API call and get the response.
            $.ajax({
                url: operationLocation,

                // Request headers.
                beforeSend: function(jqXHR){
                    jqXHR.setRequestHeader("Content-Type","application/json");
                    jqXHR.setRequestHeader(
                        "Ocp-Apim-Subscription-Key", subscriptionKey);
                },

                type: "GET",
            })

            .done(function(data) {
                // Show formatted JSON on webpage.
                $("#responseTextArea").val(JSON.stringify(data, null, 2));
                var results = data.analyzeResult.documentResults[0];
                $("#MerchantName").text(results.fields.MerchantName.text);
                $("#MerchantAddress").text(results.fields.MerchantAddress.text);
                $("#MerchantPhoneNumber").text(results.fields.MerchantPhoneNumber.text);
                $("#TransactionDateAndTime").text(results.fields.TransactionDate.text+" "+results.fields.TransactionTime.text);
                $("#items").empty();
                var thisItems = results.fields.Items.valueArray;
                console.log("Items:"+thisItems.length);
                for(let x=0;x<thisItems.length;x++){
                    console.log(thisItems[x].valueObject);
                    var thisLi = document.createElement("li");
                    thisLi.innerHTML = thisItems[x].valueObject.Quantity.text + " "+
                    thisItems[x].valueObject.Name.text + " "+
                    thisItems[x].valueObject.TotalPrice.text;
                    $("#items").append(thisLi);
                }
                $("#Subtotal span").text(results.fields.Subtotal.text);
                $("#Tax span").text(results.fields.Tax.text);
                $("#Total span").text(results.fields.Total.text);
            })

            .fail(function(jqXHR, textStatus, errorThrown) {
                // Display error message.
                var errorString = (errorThrown === "") ? "Error. " :
                    errorThrown + " (" + jqXHR.status + "): ";
                errorString += (jqXHR.responseText === "") ? "" :
                    (jQuery.parseJSON(jqXHR.responseText).message) ?
                        jQuery.parseJSON(jqXHR.responseText).message :
                        jQuery.parseJSON(jqXHR.responseText).error.message;
                alert(errorString);
            });
        }, 10000);
    })

    .fail(function(jqXHR, textStatus, errorThrown) {
        // Put the JSON description into the text area.
        $("#responseTextArea").val(JSON.stringify(jqXHR, null, 2));
        // Display error message.
        var errorString = (errorThrown === "") ? "Error. " :
            errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" :
            (jQuery.parseJSON(jqXHR.responseText).message) ?
                jQuery.parseJSON(jqXHR.responseText).message :
                jQuery.parseJSON(jqXHR.responseText).error.message;
        alert(errorString);
    });
};