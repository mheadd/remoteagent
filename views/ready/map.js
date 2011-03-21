function(doc) {
 if(doc.state == 'ready') {
  emit(doc._id, null); 
 }  
}
