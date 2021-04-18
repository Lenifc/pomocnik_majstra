    // Generuje czas dodania, ktory sluzy za sortowanie w firestore
    export function getTime() {
        let time = new Date()
        // NIE DZIELIC PONIZSZEJ LINII NA DWIE!!!!!
        let currTime = `${time.getFullYear()}-${checkIfUnderTen(time.getMonth()+1)}-${checkIfUnderTen(time.getDate())} ${checkIfUnderTen(time.getHours())}:${checkIfUnderTen(time.getMinutes())}:${checkIfUnderTen(time.getSeconds())}`
        // NIE DZIELIC POWYZSZEJ LINII NA DWIE!!!!!
        return currTime
      }
  
      function checkIfUnderTen(number) {
        return number = number < 10 ? '0' + number : number
      }