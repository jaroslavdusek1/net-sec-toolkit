export default function About() {
    return <div>
        <h2>about</h2>
        <AppExplanation />
    </div>
}

/**
 * A React component that provides an explanation about the app.
 * It informs users about the backstory, purpose, and technology used in the app.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */
const AppExplanation = () => {
    return (
        <div style={{ textAlign: 'left' }}>
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '10rem' }}>
                !! heads up, this app is just for testing and ethical hacking purposes, best to run it in a lab or virtual machine, i'm not responsible if anyone uses this app and causes any harm !!
            </p>
            <p>
                hey, this apsssp's a bit of a mix of my interests in pentesting, networking, also security in general and learning C <br />
                been diving into these techs for the last year and a half, soaking up what i can from books and stuff i just basically wanted to try it in practice
                <br /><br />
                so, for the tech <br />
                on the front-end, it's all about react and <strong>typescript</strong> <br />
                back-end is a different story - it's written in <strong>C</strong>, using the libmicrohttpd library for the http server, plus some <strong>python</strong> scripts.
                <br /><br />
                i know, react with typescript for front-end and C for back-end is not everyday combo. usually, you would use express or node.js, but i wanted to roll up my sleeves and code something meaningful in C
            </p>
        </div>
    );
};
