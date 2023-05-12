function deleteRequest(deleteBTN) {
    let message = confirm("Are you sure you want to delete the request?")
    if (message) {
        let request = deleteBTN.parentNode.parentNode;
        let ID = request.id;
        let div = document.getElementById(ID);
        div.parentNode.removeChild(request);
    }
};