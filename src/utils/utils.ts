/* eslint-disable prefer-const */
import * as bcrypt from 'bcrypt';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const isMatchPassword = async (enterPassword, hashedPassword) => {
  return await bcrypt.compare(enterPassword, hashedPassword);
};

const sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
};

const isTokenExpired = (token: { exp: number }): boolean => {
  const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại (Unix Timestamp)
  return currentTime >= token.exp; // So sánh thời gian hiện tại với thời gian hết hạn (exp) của JWT
};
export { hashPassword, isMatchPassword, sortObject, isTokenExpired };
