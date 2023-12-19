import Console from 'react-console-emulator';
import { Tops } from '../api/top.ts';
import { SIGKILLbaby } from '../api/sigkill.ts';
import { useState } from 'react';
import LoadingCircle from '../components/Spinner';
import '../styles/App.css';

export default function Top() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const renderTable = (data) => {
        return (
            <table className="table-full-width">
                <thead>
                    <tr>
                        <th>PID</th>
                        <th>COMMAND</th>
                        <th>%CPU</th>
                        <th>TIME</th>
                        <th>#TH</th>
                        <th>#WQ</th>
                        <th>#PORT</th>
                        <th>MEM</th>
                        <th>PURG</th>
                        <th>CMPRS</th>
                        <th>PGRP</th>
                        <th>PPID</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            <td>{row.PID}</td>
                            <td>{row.COMMAND}</td>
                            <td>{row["%CPU"]}</td>
                            <td>{row.TIME}</td>
                            <td>{row["#TH"]}</td>
                            <td>{row["#WQ"]}</td>
                            <td>{row["#PORT"]}</td>
                            <td>{row.MEM}</td>
                            <td>{row.PURG}</td>
                            <td>{row.CMPRS}</td>
                            <td>{row.PGRP}</td>
                            <td>{row.PPID}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const commands = {
        top: {
            description: 'list all processes',
            fn: async function () {
                setLoading(true);
                try {
                    let responseJson = await Tops();
                    responseJson = responseJson.filter(item => /^[\d\.]+$/.test(item['%CPU']));
                    setData(responseJson);
                    setLoading(false);
                    return renderTable(responseJson);
                } catch (error) {
                    setLoading(false);
                    console.error('Error:', error);
                    return `Error: ${error.message}`;
                }
            }
        },

        kill: {
            description: 'Terminate a process and its child processes based on the provided PID',
            fn: async function (pid) {
                setLoading(true);
                try {
                    const response = await SIGKILLbaby(pid);
                    setLoading(false);
                    return <span style={{ color: 'green' }}>{response}</span>;
                } catch (error) {
                    setLoading(false);
                    console.error('Error when trying to kill the process:', error);
                    return `Error: ${error.message}`;
                }
            }
        },
    };

    return (
        <div>
            <h2>process management</h2>
            {loading && <LoadingCircle />}
            <div className="terminal">
                <h2 style={{ color: 'red' }}>terminator</h2>
                <Console
                    commands={commands}
                    style={{
                        textAlign: 'left',
                        background: 'transparent',
                        color: 'green !important',
                    }}
                    promptLabel=">>>"
                />
            </div>
            <Explanation />
        </div>
    );
}

/**
 * A React component that provides an explanation about the top functionality.
 * It informs users about the purpose and utility of the top feature.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */
const Explanation = () => {
    return (
        <div style={{ textAlign: 'left' }}>
            <p>
                <br />

                the <b>top</b> in this app is all about keeping tabs on what's running on your system. <br /> 
                it is like dashboard for process management:
                <br />
                <br />
                you can use these commands:
                <br />
                <strong>top</strong>- lets you see all the processes currently running, a good way to get a snapshot of what is right know happening under the hood
                <br />
                <strong>kill</strong>- when you need to stop a process, this command does the trick
                <br />
                <br />
                its a pretty handy for getting a quick view of your system's activity
            </p>
        </div>
    );
};
