var socket = io.connect(); 

socket.on('appdata', function (data) {
    var str = data.id;
    if (str.search("button") != -1) {
        var ledcolor = (data.value == 1) ? "#bbbbbb" : "#cc0000";
        document.getElementById(data.id).style.color = ledcolor;
    }
    else {
        if (data.value == 1) {
            $('input:radio[name=' + data.id + ']')[0].checked = true;
        }
        else {
            $('input:radio[name=' + data.id + ']')[1].checked = true;
        }
    }
});

$(document).ready(function(){
    var led = ['led18', 'led23', 'led24', 'led25'];
        for(var i=0; i < led.length; i++) {
            $('#' + led[i]).change({lednr:led[i]}, function(event){
                var value = $("input[name=" + event.data.lednr + "]:checked").val();
                socket.emit('appdata', {'id' : event.data.lednr, 'value' : parseInt(value)});
                console.log(event.data.lednr + ' '+ value);
            });
        }
});

