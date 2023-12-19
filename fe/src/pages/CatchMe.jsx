import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Map from '../components/Map.jsx';
import Button from 'react-bootstrap/Button';
import LoadingCircle from '../components/Spinner';

/**
 * A React component that fetches and displays the user's current public IP address 
 * and related information, such as location, internet service provider (ISP), etc.
 * It provides a button to trigger the IP information fetch and renders the details 
 * in a table format, along with a map indicating the approximate location.
 * 
 * @component
 * @returns {JSX.Element} A rendered CatchMe component.
 */

export default function CatchMe() {
    const [ipInfo, setIpInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleButtonClick = async () => {
        setIsLoading(true);
        const token = "93f79991353a11";
        try {
            const response = await fetch(`https://ipinfo.io/json?token=${token}`);
            if (response.ok) {
                const data = await response.json();
                setIpInfo(data);
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('An error occurred:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <h2>catch me (if you can)</h2>
            <Button variant="outline-danger" size="lg" onClick={handleButtonClick} style={{marginBottom: '20px'}}>
                try
            </Button>
            {isLoading ? (
                <LoadingCircle />
            ) : (
                ipInfo && (
                    <div>
                        <Table striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <th>Attribute</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>IP Address</td>
                                    <td>{ipInfo.ip}</td>
                                </tr>
                                <tr>
                                    <td>City</td>
                                    <td>{ipInfo.city}</td>
                                </tr>
                                <tr>
                                    <td>Region</td>
                                    <td>{ipInfo.region}</td>
                                </tr>
                                <tr>
                                    <td>Country</td>
                                    <td>{ipInfo.country}</td>
                                </tr>
                                <tr>
                                    <td>ISP</td>
                                    <td>{ipInfo.org}</td>
                                </tr>
                                <tr>
                                    <td>Location</td>
                                    <td>{ipInfo.loc}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <Map
                            latitude={parseFloat(ipInfo.loc.split(',')[0])}
                            longitude={parseFloat(ipInfo.loc.split(',')[1])}
                        />
                    </div>
                )
            )}
        <Explanation/>
        </div>
    );
}

/**
 * A React component that provides an explanation about the CatchMe functionality.
 * It informs users about the purpose and utility of the CatchMe feature.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */

const Explanation = () => {
    return (
      <div>
        <p>
        this feature displays the user's current public IP address and related information, such as location, internet service provider (ISP),<br />it helps users to obtain details about their internet connection and online security.
        </p>
      </div>
    );
  };