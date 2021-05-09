export default function validPhoneNum(number) {
    let temp = number.replace(/[^0-9]+/g, '');
    if (temp.length == 9) {
      return temp.slice(0, 3) + "-" + temp.slice(3, 6) + "-" + temp.slice(6, 9);
    }
    if (temp.length == 7) {
      return temp.slice(0, 3) + "-" + temp.slice(3, 5) + "-" + temp.slice(5, 8);
    }
    return false
  }