
    function PopupFunc(status, msg) {

    const myNotification = window.createNotification({
      closeOnClick: true,
      displayCloseButton: false,

      positionClass: 'nfc-bottom-right',
      showDuration: 6000,

      // success, info, warning, error, and none
      theme: status
    })
    myNotification({
      title: status,
      message: msg,
    })
} 
  export default PopupFunc