
document.getElementById('addExerciseButton').addEventListener('click',function(event){      //Add listener to addExerciseButton

var addExercise = document.getElementById("addExercise");
var request = new XMLHttpRequest();
//sets the query URL for the DB interactions
var holder ="exercise="+addExercise.elements.exercise.value+"&reps="+addExercise.elements.reps.value+"&weight="+addExercise.elements.weight.value+"&date="+addExercise.elements.date.value;

if(addExercise.elements.lbsOr.checked){
  holder += "&lbsOr=1";                                     //bool check again
}
else{
  holder += "&lbsOr=0";
}

request.open("GET", "/insert?" + holder, true);                 //Open the get request for asynchronous with the holder url packed
request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

request.addEventListener('load', function(){
  if(request.status >= 200 && request.status < 400){
    var response = JSON.parse(request.responseText);
    var id = response.inserted;
    
     //prepping for table fill
    var table = document.getElementById("exerciseTable");
    var row = table.insertRow(1);

    //creating cells and appending them to the rows to match the headers
    var exerName = document.createElement('td');
    exerName.textContent = document.getElementById('exercise').value;
    row.appendChild(exerName);


    var repCount = document.createElement('td');
    repCount.textContent = document.getElementById('reps').value;
    row.appendChild(repCount);


    var weightAmount = document.createElement('td');
    weightAmount.textContent = document.getElementById('weight').value;
    row.appendChild(weightAmount);


    var completion = document.createElement('td');
    completion.textContent = document.getElementById('date').value;
    row.appendChild(completion);

    var unitChecker = document.createElement('td');
    if(addExercise.elements.lbsOr.checked){                 //once again the bool strikes comparing, you guessed it, lbs or kg
      unitChecker.textContent = "lbs";
    }
    else{
      unitChecker.textContent = "kg";
    }
    row.appendChild(unitChecker);
    //adding the up date and delete buttons with DOM for each row
    var yupDate = document.createElement('td');
    var updateDataLink = document.createElement('a');
    updateDataLink.setAttribute('href','/entryEdit?id=' + id);
    var updateButton = document.createElement('input');

    updateButton.setAttribute('value','Edit');
    updateButton.setAttribute('type','button');
    updateDataLink.appendChild(updateButton);
    yupDate.appendChild(updateDataLink);
    row.appendChild(yupDate);


    var deleteCell = document.createElement('td');
    var deleteButton = document.createElement('input');
    deleteButton.setAttribute('type','button');
    deleteButton.setAttribute('name','delete');
    deleteButton.setAttribute('value','Delete');
    deleteButton.setAttribute('onClick', 'deleteData("dataTable",' + id +')');//calls deleteData function with ID as a param

    var deleteHidden = document.createElement('input');
    deleteHidden.setAttribute('type','hidden'); //those hidden attributes though
    deleteHidden.setAttribute('id', 'delete' + id);
    deleteCell.appendChild(deleteButton);
    deleteCell.appendChild(deleteHidden);
    row.appendChild(deleteCell);
   
  }
  else {
      console.log("error");
     
  }
});
 request.send("/insert?" + holder");
  //no refreshes!
});
//function that well, deletes an entry
function deleteData(tableId, id){
var deleteItem = "delete" + id;                           //will match assigned hidden ID's
var table = document.getElementById("exerciseTable");
var numRows = table.rows.length;

for(var i = 1; i < numRows; i++){
  var row = table.rows[i];
  var findData = row.getElementsByTagName("td");
  var erase = findData[findData.length -1];
  if(erase.children[1].id === deleteItem){                //matches delete ID with row
    table.deleteRow(i);
    i = numRows;
  }
}
var req = new XMLHttpRequest();
req.open("GET", "/delete?id=" + id, true);

req.addEventListener("load",function(){
  if(req.status >= 200 && req.status < 400){
      console.log('success');
  } else {
      console.log('error');
  }
});
req.send("/delete?id=" + id);
}
