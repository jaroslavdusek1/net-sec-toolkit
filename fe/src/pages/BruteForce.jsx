import React, { useState } from 'react';
import styled from 'styled-components';
import { dictionaryAttack } from '../api/bruteForceApi';

const Container = styled.div`
  padding: 10px;
  max-width: 400px;
  margin: 20px auto;
  background-color: #333;  /* dark grey */
  border: 2px solid #000;  /* black border */
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 16px;
  color: #FFF;
`;

const Input = styled.input`
  padding: 5px;
  font-size: 16px;
  border: 1px solid #000;
  background-color: #444;  /* darker grey */
  color: #FFF;
  outline: none;
`;

const Button = styled.button`
  padding: 5px 10px;
  font-size: 16px;
  cursor: pointer;
  background-color: #555;  /* slightly grey */
  color: #FFF;
  border: 1px solid #000;
`;

const Message = styled.p`
  color: #FFF;
`;


/**
 * A React component that provides a user interface for testing the security of a password 
 * against a dictionary attack. Users can enter a password, which is then checked against
 * a large list of commonly used passwords. The component also provides a feature to generate
 * a secure random password as a suggestion for users.
 * 
 * @component
 * @returns {JSX.Element} A rendered BruteForceCheck component.
 */

const BruteForceCheck = () => {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await dictionaryAttack(password);
      console.log("response", response);
      setResult(response);
    } catch (error) {
      setResult('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const [generatedPassword, setGeneratedPassword] = useState('');

  const handleGeneratePassword = (e) => {
    e.preventDefault();
    const newPassword = generateRandomPassword();
    setGeneratedPassword(newPassword);
  };

  const generateRandomPassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    const passwordLength = 16;
    let newPassword = '';

    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      newPassword += characters[randomIndex];
    }

    return newPassword;
  };


  return (
    <>
      <h2>brute force check</h2>
      <Container>
        <Form onSubmit={handleSubmit}>
          <Label>
            enter password:{" "}
            <Input type="text" value={password} onChange={handlePasswordChange} />
          </Label>
          <Button type="submit" disabled={loading}>Check Password</Button>
        </Form>
        {loading && <Message>Loading...</Message>}
        {result && <Message>{result}</Message>}
      </Container>
      <Explanation />

      <br />
      <h4>secure pw example</h4>
      <Container>
        <Form>
          <Label>
            generated password:{" "}
            <Input type="text" value={generatedPassword} readOnly />
          </Label>
          <Button onClick={handleGeneratePassword}>Generate Password</Button>
        </Form>
      </Container>
      <ExplanationPW />
    </>
  );
};

/**
 * A React component that provides an explanation about the BruteForceCheck functionality.
 * It describes how the user's password is compared against a list of commonly used passwords 
 * to assess its security, and how the backend API and Python script work together to perform 
 * this check.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */

const Explanation = () => {
  return (
    <div>
      <p>
        the user interface utilizes a Python script to compare entered password against a passwords file (1milion passwords) of commonly used passwords from data breaches,<br />
        if a match is found, user is alerted to the security risk and can take steps to improve account's security, avoiding easily guessable passwords<br /><br />
        how does it work? Once pw entered i call BE api which pass the password as an argument and run python script that goes through and compare every pw in passwords file and return result back to the client
      </p>
    </div>
  );
};

/**
 * A React component that provides an explanation about the importance of using secure passwords.
 * It gives insights into the mathematics behind password security, emphasizing the importance 
 * of password length and character variety. The component also promotes the use of password 
 * managers for handling complex passwords.
 * 
 * @component
 * @returns {JSX.Element} A rendered ExplanationPW component.
 */

const ExplanationPW = () => {
  return (
    <div>
      <p>
        in general to be more save use 16 chars and more, lower, upper case, numbers and special symbols, dont use your personal pws at work, many people do,
        possible combinations with brute force 37,157,429,083,410,091,685,945,089,785,856 (possible combinations)
        <br />
        <br />
        example: 16 chars long pw, brute force 62 possible chars ^ 16 (pw length) / (1 billion attempts per second, which is pretty fast) = roughly 1.093 x 10^12 years = 1.093 trillion years to break, i personally use 30+ chars, no pw is unbreakable but stay more secure<br />
        i know is almost impossible and you dont wanna to remember these non sense random string, use password manage
      </p>
    </div>
  );
};

export default BruteForceCheck;