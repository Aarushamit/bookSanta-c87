import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'

export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName:"",
      reasonToRequest:"",
      isBookRequestActive: '',
      requestId: '',
      requestedBookName: '',
      bookStatus: '',
      docId: '',
      userDocId: ''
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }



  addRequest =async(bookName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    db.collection('requested_books').add({
        "user_id": userId,
        "book_name":bookName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
        "book_status": "requested", 
        "date": firebase.firestore.FieldValue.serverTimestamp()
    })
    
    await this.getBookRequest()
    db.collection('users').where('email_id', '==', userId).get().then()
    .then((snapshot)=> {
      snapshot.forEach((document)=>{
        db.collection('users').doc(document.id).update({
          isBookRequestActive: true
        })
      })
    })

    this.setState({
        bookName :'',
        reasonToRequest : '',
        //
    })

    return Alert.alert("Book Requested Successfully")
  }

getBookRequest = ()=> {
  //getting the requested books
  db.collection('requested_books')
  .where('user_id', '==', this.state.userId)
  .get().then((snapshot)=> {
    snapshot.forEach((document)=> {
      if(document.data().book_status!=='received') {
        this.setState({
          requestId: document.data().request_id,
          requestedBookName: document.data().book_name,
          bookStatus: document.data().book_status,
          docId: document.id
        })
      }
    })
  })
}

getIsBookRequestActive(){
  db.collection('users')
  .where('email_id','==',this.state.userId)
  .onSnapshot(querySnapshot => {
    querySnapshot.forEach(doc => {
      this.setState({
        isBookRequestActive: doc.data().isBookRequestActive,
        userDocId : doc.id
      })
    })
  })
}

componentDidMount(){
  this.getIsBookRequestActive();
  this.getBookRequest();
}

sendNotification = () => {
  db.collection('users'). where('email_id', '==', this.state.userId).get().then((snapshot)=> {
    snapshot.forEach((document)=> {
      var name = document.data().first_name
      var lastName = document.data().last_name

      db.collection('all_notifications').where('request_id', '==', this.state.requestId).get().then((snapshot)=> {
        snapshot.forEach((document)=> {
          var donorId = document.data().donor_id
          var bookName = document.data().book_name

        db.collection('all_notifications').add({
            "targeted_user_id"    : donorId,
            "book_name"           : bookName,
            "notification_status" : "unread",
            "message"             :  name + " " + lastName + " recieved the book " + bookName, 
        })
        })
      })
    })
  })
}

updateBookRequestStatus = () => {
  db.collection('requested_books').doc(this.state.docId).update({
    book_status: 'received'
    
  })

  db.collection('users'). where('email_id', '==', this.state.userId).get().then((snapshot)=> {
    snapshot.forEach((document)=> {
      db.collection("users").doc(document.id).update({
        isBookRequestActive: false
      })
    })
  })
}


receivedBooks = (bookName) => {
  db.collection('received_books').add({
    'user_id': this.state.userId,
    'book_name':  bookName,
    "request_id":this.state.requestId,
    "bookStatus" : "received"
  })
}
  render(){
    if(this.state.isBookRequestActive === true){
    return(
      <View style = {{flex: 1, justifyContent: 'center'}}>
        <View style = {{borderColor: 'orange', borderWidth: 2, justifyContent: 'center', alignItems: 'center', padding: 10, margin:10}}>
            <Text>
              Book Name
            </Text>
            <Text>
              {this.state.requestedBookName}
            </Text>
        </View>
        <View style = {{borderColor: 'orange', borderWidth: 2, justifyContent: 'center', alignItems: 'center', padding: 10, margin:10}}>
            <Text>
              Book Status
            </Text>
            <Text>
              {this.state.bookStatus}
            </Text>
        </View>
        <TouchableOpacity style = {{borderWidth: 1, borderColor: 'orange', backgroundColor: 'orange', width: 300, alignSelf: 'center', alignItems: 'center', height: 30, marginTop: 30}}
        onPress = {()=> {
          this.sendNotification();
          this.updateBookRequestStatus();
          this.receivedBooks(this.state.requestedBookName);
        }}
        >
          <Text> I have received the book </Text>
        </TouchableOpacity>

      </View>
    )
    }
    else{
      return(
        <View style={{flex:1}}>
          <MyHeader title="Request Book" navigation ={this.props.navigation}/>
          <ScrollView>
            <KeyboardAvoidingView style={styles.keyBoardStyle}>
              <TextInput
                style ={styles.formTextInput}
                placeholder={"enter book name"}
                onChangeText={(text)=>{
                    this.setState({
                        bookName:text
                    })
                }}
                value={this.state.bookName}
              />
              <TextInput
                style ={[styles.formTextInput,{height:300}]}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the book"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{this.addRequest(this.state.bookName,this.state.reasonToRequest)}}
                >
                <Text>Request</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
            </ScrollView>
        </View>
    )
    }

  }
}


const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)
