
// $('#send-todo').on('click',function () {
//     $.post('/send_todos', function (data) {
//         // console.log(data);
//     });
// }, 'json');
$(document).on("click", '#send-todo', function () {
    $.ajax({
        url: "/send_todos",
        type: 'GET',
        dataType: 'json', // added data type
        complete: function() {
            //called when complete
            console.log('process complete');
          },
        success: function (res) {
            console.log(res);
        }
    });
});