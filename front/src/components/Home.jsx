import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/fr';
import '../style/Home.scss';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

export default function Home() {
    // ALL USE STATES
    const [jeux, setJeux] = useState([]);
    const [jeuxNote, setJeuxNote] = useState([]);
    const [jeuxAdded, setJeuxAdded] = useState([]);
    const [user, setUser] = useState([]);
    const [com, setCom] = useState([]);
    const [loc, setLoc] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentIndex2, setCurrentIndex2] = useState(0);
    const [currentIndex3, setCurrentIndex3] = useState(0);
    const [isLogin, setIsLogin] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [selectedGame, setSelectedGame] = useState(false);
    const [comment, setComment] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [pseudo, setPseudo] = useState('');
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loginData, setLoginData] = useState({email: '',password: ''});
    const [isLoggedIn, setLoggedIn] = useState(true);
    const [isLocated, setLocated] = useState(true);
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        const fetchJeux = async () => {
            try {
                // BASIC GET FOR ALL GAMES, USERS, COMMENTS AND RENTALS
                const jeuxRes = await axios.get('http://localhost:3000/jeu');
                const jeuxRecuperes = jeuxRes.data;
                const userRes = await axios.get('http://localhost:3000/utilisateur');
                const userRecuperes = userRes.data;
                const comRes = await axios.get('http://localhost:3000/comment');
                const comRecuperes = comRes.data;
                const comUserRes = await axios.get('http://localhost:3000/comment-user');
                const comUserRecuperes = comUserRes.data;
                const combinedComments = comRecuperes.map(comment => {
                    const user = comUserRecuperes.find(user => user.idUser === comment.idUser);
                    return { ...comment, pseudo: user ? user.pseudo : 'Unknown' };
                });
                const locRes = await axios.get('http://localhost:3000/emprunt');
                const locRecuperes = locRes.data;
                setUser(userRecuperes);
                setCom(combinedComments);
                setLoc(locRecuperes);
            } catch (error) {
                console.error(error);
            }
        }

        fetchJeux();
    }, []);

    useEffect(() => {
        const searchSys = async () => {
            // CALL SETS & FILTER ALL SETS BY NAME AND SET THEM IN ANOTHER ARRAY
            try {
                const jeuxRes = await axios.get('http://localhost:3000/jeu');
                const jeuxRecuperes = jeuxRes.data;
                setJeux(jeuxRecuperes);
                const filteredJeux = jeuxRecuperes.filter(jeu =>
                    jeu.nom.toLowerCase().includes(search.toLowerCase())
                );
                setSearchResults(filteredJeux);
            } catch (error) {
                console.error(error);
            }
        }
        searchSys();
    }, [search]);

    useEffect(() => {
        // SORT GAMES BY RATING
        const sortJeux = () => {
            const jeuxArray = [...jeux];
            jeuxArray.sort((a, b) => b.note - a.note);
            setJeuxNote(jeuxArray);
        };

        sortJeux();
    }, [jeux]);

    useEffect(() => {
        // SORT GAMES BY ID TO HAVE THEM IN ORDER OF ADDITION
        const sortJeux = () => {
            const jeuxArray = [...jeux];
            jeuxArray.sort((a, b) => b.idJeux - a.idJeux);
            setJeuxAdded(jeuxArray);
        };

        sortJeux();
    }, [jeux]);

    const ls = localStorage;

    // ALL HANDLE FOR POPUPS
    const handleNext = () => {
        setCurrentIndex((prevIndex) => prevIndex + 2);
    };
    
    const handlePrev = () => {
        setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 2));
    };

    const handleNext2 = () => {
        setCurrentIndex2((prevIndex) => prevIndex + 7);
    };
    
    const handlePrev2 = () => {
        setCurrentIndex2((prevIndex) => Math.max(0, prevIndex - 7));
    };

    const handleNext3 = () => {
        setCurrentIndex3((prevIndex) => prevIndex + 7);
    };
    
    const handlePrev3 = () => {
        setCurrentIndex3((prevIndex) => Math.max(0, prevIndex - 7));
    };

    const handleLoginClick = () => {
        setIsLogin(true);
    };

    const closeLoginPopup = () => {
        setIsLogin(false);
    };

    const handleRegisterClick = () => {
        setIsRegister(true);
    };

    const closeRegisterPopup = () => {
        setIsRegister(false);
    };

    const closeGamePopup = () => {
        setSelectedGame(null);
    };

    // HANDLE FOR THE USER TO CHOOSE A RATE 
    const handleRatingClick = async (rating) => {
        setUserRating(rating);

        if (!selectedGame) {
            console.error('No game selected');
            return;
        }

        try {
            const updatedGame = {
                ...selectedGame,
                note: (Number(selectedGame.note) + Number(rating))/2,
            };

            await axios.put(`http://localhost:3000/jeu/${selectedGame.idJeux}`, updatedGame);
            window.location.reload();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la note du jeu :', error);
        }
    };

    // HANDLE TO SAVE THE GAME THE USER HAS CLICKED ON FOR THE UNSORTED GAME LIST
    const handleGameClick = (index) => {
        const clickedGame = jeux[currentIndex + index]
        setSelectedGame(clickedGame);

        const existingLoc = loc.find(
            (location) =>
                Number(location.idJeux) === Number(clickedGame.idJeux) &&
                Number(location.idUser) === Number(ls.getItem("key1")) &&
                moment().isBetween(moment(location.date_emprunt), moment(location.date_retour))
        );
    
    
        if (existingLoc) {
            setLocated(true);
        } else {
            setLocated(false);
        }
    };

    // HANDLE TO SAVE THE GAME THE USER HAS CLICKED ON FOR THE SEARCH GAME LIST
    const handleGameClickSearch = (index) => {
        setSelectedGame(searchResults[currentIndex + index]);
    }

    // HANDLE TO SAVE THE GAME THE USER HAS CLICKED ON FOR THE RATING GAME LIST
    const handleGameClickRating = (index) => {
        const clickedGame = jeuxNote[currentIndex + index];
        setSelectedGame(clickedGame);
    
        const existingLoc = loc.find(
            (location) =>
                Number(location.idJeux) === Number(clickedGame.idJeux) &&
                Number(location.idUser) === Number(ls.getItem("key1")) &&
                moment().isBetween(moment(location.date_emprunt), moment(location.date_retour))
        );
    
        if (existingLoc) {
            setLocated(true);
        } else {
            setLocated(false);
        }
    };
    
    
// HANDLE TO SAVE THE GAME THE USER HAS CLICKED ON FOR THE ADDED GAME LIST
    const handleGameClickAdded = (index) => {
        const clickedGame = jeuxAdded[currentIndex + index]
        setSelectedGame(clickedGame);

        const existingLoc = loc.find(
            (location) =>
                Number(location.idJeux) === Number(clickedGame.idJeux) &&
                Number(location.idUser) === Number(ls.getItem("key1")) &&
                moment().isBetween(moment(location.date_emprunt), moment(location.date_retour))
        );
    
    
        if (existingLoc) {
            setLocated(true);
        } else {
            setLocated(false);
        }
    };

    // HANDLE FOR THE TEXTAREA SUBMIT WHEN USER PRESS ENTER
    const handleKeyDownEnter = async(e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmitComment();
        }
    };

    // FUNCTION FOR SUBMIT NEW COMMENT
    const handleSubmitComment = async (e) => {
        e.preventDefault();
    
        if (!selectedGame) {
            console.error('No game selected');
            return;
        }

        const newComment = {
            comment: comment,
            comDate: Date.now(),
            idJeux: selectedGame.idJeux,
            idUser: ls.getItem("key1"),
        };
    
        try {
            const res = await axios.post(`http://localhost:3000/comment`, newComment);

            console.log(res);
            setCom((prevComments) => [...prevComments, { ...newComment, pseudo: ls.getItem("key2") }]);
            setComment('');
        } catch (error) {
            console.error('Erreur lors de la publication de l\'article :', error);
        }
    };

    // FUNCTION FOR CREATE NEW RANTALS
    const handleSubmitLoc = async (e) => {
        e.preventDefault();
    
        if (!selectedGame) {
            console.error('No game selected');
            return;
        }

        const newLoc = {
            date_emprunt: moment().format('YYYY-MM-DD HH:mm:ss'),
            date_retour: moment().add(24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
            idJeux: selectedGame.idJeux,
            idUser: ls.getItem("key1"),
        };

        console.log(newLoc);
    
        try {
            const res = await axios.post(`http://localhost:3000/emprunt`, newLoc);
            console.log(res);
        } catch (error) {
            console.error('Erreur lors de la publication de l\'article :', error);
        }

        window.location.reload();
    };

    // FUNCTION FOR CANCEL RENTALS
    const handleCancelLoc = async () => {
        if (!selectedGame) {
            console.error('No game selected');
            return;
        }

        
        try {
            const existingLoc = loc.find(
                (location) =>
                Number(location.idJeux) === Number(selectedGame.idJeux) &&
                Number(location.idUser) === Number(ls.getItem("key1")) &&
                moment().isBetween(moment(location.date_emprunt), moment(location.date_retour))
                );
                
            console.log(existingLoc.idLoc)

            if (existingLoc) {
                await axios.delete(`http://localhost:3000/emprunt/${existingLoc.idLoc}`);
                window.location.reload();
            } else {
                console.log("Aucun emprunt à annuler");
            }
        } catch (error) {
            console.error('Erreur lors de l\'annulation de l\'emprunt :', error);
        }
    };
    
    moment.locale('fr');

    // HANDLE FOR CREATE ACCOUNT
    const handleRegister = async (e) => {
        e.preventDefault();
        let state = true;
        try {
            const check = await axios.get('http://localhost:3000/utilisateur');
            for (let i = 0; i < check.data.length -1; i++ ) {
                if (check.data[i].email === email) {
                    state = false;
                }
            }
            if (state) {
                const newUser = {
                    pseudo: pseudo,
                    email: email,
                    pwd: pwd,
                }
                const res = await axios.post('http://localhost:3000/utilisateur', newUser);
                isRegister(false);
            } else {
                console.log('Le compte existe déjà');
            }
        } catch (error) {
            console.error('Erreur durant la création du compte :', error);
        }
    }

    // HANDLE FOR LOGIN AN ACCOUNT TO THE WEBSITE
    const handleLogin = async (req, res) => {
        try {
            localStorage.clear();
            const ls = localStorage;
            const result = await axios.post('http://localhost:3000/login', loginData);
            if(result.status === 200) {
                setLoggedIn(true);
                const userData = result.data;
                const ls = localStorage;
                ls.setItem("key1", userData.id);
                ls.setItem("key2", userData.pseudo);
                ls.setItem("key3", userData.email);
                console.log("connecté");
                setIsConnected(true);
                setIsLogin(false);
            } else {
                console.log("Pas co !");
                setIsConnected(false);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json('Erreur');
        }
    }

    // FUNCITON FOR DISCONNECT USER
    const handleLogout = async (req, res) => {
        try {
            localStorage.clear();
            setLoggedIn(false);
            setIsConnected(false);
            setIsLogin(false);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='content'>
            <div className="container-page">
                {isLogin && (
                    <div className="login-popup">
                        <div className="container">
                            <div className="title">
                                <h2>Connexion</h2>
                            </div>
                            <div className="form">
                                <div className="email">
                                    <input type="text" placeholder='Email' onChange={(e) => setLoginData({...loginData, email: e.target.value})} required/>
                                </div>
                                <div className="password">
                                    <input type="password"placeholder='Password' onChange={(e) => setLoginData({...loginData, password: e.target.value})} required/>
                                </div>
                                <div className="submit">
                                    <span onClick={handleLogin}>Envoyer</span>
                                </div>
                            </div>
                            <div className="close-btn" onClick={closeLoginPopup}>
                                <CloseIcon />
                            </div>
                        </div>
                    </div>
                )}
                {isRegister && (
                    <div className="register-popup">
                        <div className="container">
                            <div className="title">
                                <h2>Créer un compte</h2>
                            </div>
                            <div className="form">
                                <div className="pseudo">
                                    <input type="text" placeholder='Pseudo' onChange={(e)=> setPseudo(e.target.value)} required/>
                                </div>
                                <div className="email">
                                    <input type="text" placeholder='Email' onChange={(e)=> setEmail(e.target.value)} required/>
                                </div>
                                <div className="password">
                                    <input type="password"placeholder='Password' onChange={(e)=> setPwd(e.target.value)} required/>
                                </div>
                                <div className="submit">
                                    <span onClick={handleRegister}>Envoyer</span>
                                </div>
                            </div>
                            <div className="close-btn" onClick={closeRegisterPopup}>
                                <CloseIcon />
                            </div>
                        </div>
                    </div>
                )}
                {selectedGame && (
                    <div className="game-popup">
                        <div className="container">
                            <div className="image">
                                <img src={selectedGame.image} alt="" />
                            </div>
                            <div className="details">
                                <div className="info">
                                    <div className="title">
                                        <h2>{selectedGame.nom}</h2>
                                    </div>
                                    <div className="content">
                                        <h2>Genre</h2>
                                        <p>{selectedGame.type}</p>
                                        <h2>Description</h2>
                                        <p>{selectedGame.descr}</p>
                                        <div className="more">
                                            <div>
                                                <h2>Prix</h2>
                                                <p>{selectedGame.prix}$</p>
                                            </div>
                                            <div>
                                                <h2>Notes</h2>
                                                <p>{selectedGame.note}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                    <span style={{textAlign: "end", fontSize: ".5rem"}}>La location dure 1 jour, celle-ci doit être renouvelée chaque jour !</span>
                                    {isLocated && (
                                        <div className="state-true">
                                                <span>Le jeu est déjà loué !</span>
                                        </div>
                                    )}
                                    {!isLocated && (
                                        <div className="state-false">
                                                <span>Le jeu n'est pas  loué !</span>
                                        </div>
                                    )}
                                <div className="action">
                                    <div className="loc">
                                    {!isLocated && (
                                        <span onClick={handleSubmitLoc}>LOUER</span>
                                    )}
                                    {isLocated && (
                                        <span >NE PEUT LOUER</span>
                                    )}
                                        <span onClick={handleCancelLoc}>ANNULER</span>
                                    </div>
                                    <div className="note">
                                        <h2>Noter</h2>
                                        <div className="note-btn">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <span key={rating} onClick={() => handleRatingClick(rating)}>
                                                {rating}
                                            </span>
                                        ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="avis">
                                <div className="title">
                                    <h2>Commentaires</h2>
                                </div>
                                <div className="comments">
                                    {com
                                        .filter(comment => comment.idJeux === (selectedGame && selectedGame.idJeux))
                                        .map((com, index) => (
                                            <div className="row-comment" key={index}>
                                                <div className="author">
                                                    <span>{ com.pseudo }</span>
                                                </div>
                                                <div className="text">
                                                    <span>{ com.comment }</span>
                                                </div>
                                                <div className="date">
                                                    <span>{moment(com.comDate).format('LLL')}</span>
                                                </div>
                                            </div>
                                    ))}
                                </div>
                                <div className="add-comments">
                                    <div className="add-comment">
                                        <h3>Ajouter un commentaire</h3>
                                        <textarea
                                            value={ comment }
                                            onChange={(e)=> setComment(e.target.value)}
                                            onKeyDown={ handleKeyDownEnter }
                                        />
                                        <div className="submit">
                                            <span onClick={handleSubmitComment}>Envoyer</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="close-btn" onClick={closeGamePopup}>
                                <CloseIcon />
                            </div>
                        </div>
                    </div>
                )}
                <div className="header">
                    <div className="logo">
                        <span>SC<span className='primary'>@</span>M<span className='primary'>3</span>RZ</span>
                    </div>
                    <div className="searchbar">
                        <div className="img">
                            <SearchIcon  style={{ fontSize: '1.8rem' }}/>
                        </div>
                        <input type="text" placeholder="Recherche" value={search} onChange={(e) => setSearch(e.target.value.toString())}/>
                    </div>
                    {!isConnected && (
                        <div className="login-btn">
                            <div className="login" onClick={handleLoginClick}>
                                <span>Connexion</span>
                            </div>
                            <div className="register" onClick={handleRegisterClick}>
                                <span>Créer un compte</span>
                            </div>
                        </div>
                    )}
                    {isConnected && (
                        <div className="login-btn">
                            <p>{ls.getItem("key2")}</p>
                            <div className="disco-btn" onClick={handleLogout}>
                                <p>DISCONNECT</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="h2">
                    <h2>JEUX RECOMMANDÉS</h2>
                </div>
                <div className="btn-carou">
                    <div onClick={handlePrev} style={{ visibility: currentIndex > 1 ? 'visible' : 'hidden' }}>
                        <ArrowBackIosIcon />
                    </div>

                    <div onClick={handleNext} style={{ visibility: currentIndex < 3 ? 'visible' : 'hidden' }}>
                        <ArrowForwardIosIcon />
                    </div>
                </div>
                <div className="carousel">
                    <div className="cards">
                    {jeuxNote.slice(currentIndex, currentIndex + 2).map((jeu, index) => (
                        <div key={index} className="card" onClick={() => handleGameClickRating(index)}>
                            <img src={jeu.image} alt="" />
                            <div className="title">
                                <span>{jeu.nom}</span>
                            </div>
                            <div className="note">
                                <span>{jeu.note}</span>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
                <div className="container">
                    {!search && (
                        <div className="container">
                                <div className="h2">
                                    <h2>RECENTLY ADDED</h2>
                                </div>
                                    <div className="btn-carou">
                                        <div onClick={handlePrev2} style={{ visibility: currentIndex2 > 1 ? 'visible' : 'hidden' }}>
                                            <ArrowBackIosIcon />
                                        </div>

                                        <div onClick={handleNext2} style={{ visibility: currentIndex2 < 2 ? 'visible' : 'hidden' }}>
                                            <ArrowForwardIosIcon />
                                        </div>
                                    </div>
                                <div className="cards"  id='filter-row'>
                                        {jeuxAdded.slice(currentIndex2, currentIndex2 + 7).map((jeu, index) => (
                                        <div key={index} className="card" onClick={() => handleGameClickAdded(index)}>
                                            <div className="image">
                                                <img src={jeu.image} alt="" />
                                            </div>
                                            <div className="resume">
                                                <div className="title">
                                                    <span>{jeu.nom}</span>
                                                </div>
                                                <div className="price">
                                                    <span>{jeu.prix}$</span>
                                                </div>
                                                <div className="note">
                                                    <span>{jeu.note}</span>
                                                </div>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                    <div className="h2">
                                        <h2>MOST POPULAR</h2>
                                    </div>
                                    <div className="btn-carou">
                                        <div onClick={handlePrev3} style={{ visibility: currentIndex3 > 1 ? 'visible' : 'hidden' }}>
                                            <ArrowBackIosIcon />
                                        </div>

                                        <div onClick={handleNext3} style={{ visibility: currentIndex3 < 2 ? 'visible' : 'hidden' }}>
                                            <ArrowForwardIosIcon />
                                        </div>
                                    </div>
                                        <div className="cards" id='filter-row'>
                                            {jeuxNote.slice(currentIndex3, currentIndex3 + 7).map((jeu, index) => (
                                                <div key={index} className="card" onClick={() => handleGameClickRating(index)}>
                                                    <div className="image">
                                                        <img src={jeu.image} alt="" />
                                                    </div>
                                                    <div className="resume">
                                                        <div className="title">
                                                            <span>{jeu.nom}</span>
                                                        </div>
                                                        <div className="price">
                                                            <span>{jeu.prix}$</span>
                                                        </div>
                                                        <div className="note">
                                                            <span>{jeu.note}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                        </div>
                    )}
                    <div className="h2">
                        <h2>TOUS NOS JEUX</h2>
                    </div>
                    {!search && (
                        <div className="cards">
                            {jeux.map((jeu, index) => (
                                <div key={index} className="card" onClick={() => handleGameClick(index)}>
                                    <div className="image">
                                        <img src={jeu.image} alt="" />
                                    </div>
                                    <div className="resume">
                                        <div className="title">
                                            <span>{jeu.nom}</span>
                                        </div>
                                        <div className="price">
                                            <span>{jeu.prix}$</span>
                                        </div>
                                        <div className="note">
                                            <span>{jeu.note}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="cards">
                        {search &&
                            searchResults.map((jeu, index) => (
                                <div key={index} className="card" onClick={() => handleGameClickSearch(index)}>
                                    <div className="image">
                                        <img src={jeu.image} alt="" />
                                    </div>
                                    <div className="resume">
                                        <div className="title">
                                            <span>{jeu.nom}</span>
                                        </div>
                                        <div className="price">
                                            <span>{jeu.prix}$</span>
                                        </div>
                                        <div className="note">
                                            <span>{jeu.note}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}