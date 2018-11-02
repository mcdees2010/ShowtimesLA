import React, { Component } from 'react';
import axios from 'axios';
import httpClient from '../../../utilities/httpClient';
import Card from 'react-bootstrap/lib/Card';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import Container from 'react-bootstrap/lib/Container';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';

class Movie extends Component{
    state = {
        movies: [],
    }
    constructMovie({title, id, poster_image_thumbnail}){
        let movie = { title, id, poster_image_thumbnail, showtimes: [], favorites: []};
        return movie;
    }
    async componentDidMount(){
        let { id } = this.props.match.params;
        let movieData = await axios.get(`https://api.internationalshowtimes.com/v4/movies/?cinema_id=${id}&apikey=RhuZxXz2vTqfvHw7sfhlcLt8UMevNdgw`);
        let showtimeData = await axios.get(`https://api.internationalshowtimes.com/v4/showtimes/?cinema_id=${id}&apikey=RhuZxXz2vTqfvHw7sfhlcLt8UMevNdgw`);
        let res = await httpClient({ method: "get", url: `/api/users/${this.props.currentUser._id}` });
        let {favorites} = res.data.showUser;
        // console.log(favorites);      
        let { movies } = movieData.data;
        let { showtimes } = showtimeData.data;
        movies = movies.map(this.constructMovie);
        movies.forEach((movie => {
            showtimes.forEach((show => {
                if (movie.id === show.movie_id){
                    movie.showtimes.push({time: show.start_at, tickets: show.booking_link})
                }
            }))
            favorites.forEach((fav => {
                if (movie.id === fav.movieID){
                    movie.favorites.push({seen: fav.seen, wantToSee: fav.wantToSee})
                }
            }))
        }))
        this.setState({ movies });
    }
    favoriteMovie = async (fav) => {
        let movie = await axios.post('/api/favorites', fav);
        console.log(movie)
    }
    unfavoriteMovie = async (unfav) => {
        let { favorite_id } = this.state.movies;
        let movie = await axios.delete(`/api/favorites/${favorite_id}`, unfav);
        // if (movie.data.success) this.setState({favorited: false});
        console.log(movie)
    }
    render(){
        let { movies } = this.state;
        let { unfavoriteMovie, favoriteMovie } = this;
        return(
            <Container>
                <Row>
                {movies.map(({id, title, poster_image_thumbnail, showtimes, seen, wantToSee}) =>
                     <Col key={id}>
            <Card style={{ width: '18rem' }}>
            <Card.Img variant="top" src={poster_image_thumbnail}/>
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>
                {seen
                    ? <Button onClick={unfavoriteMovie} variant="outline-dark">unfavorite</Button>
                    : <Button onClick={()=>favoriteMovie({movieID:id, title, seen: true, wantToSee: false})} variant="outline-info">seen it</Button>
                }
                {wantToSee
                    ? <Button variant="outline-dark">unfavorite</Button>
                    : <Button onClick={() => favoriteMovie({movieID: id, title, seen: false, wantToSee: true})} variant="outline-dark">want to see</Button>
                }
                </Card.Text>
            </Card.Body>
            <ul>
                {showtimes.map((s, i) => 
            <ListGroup className="list-group-flush">
                <ListGroupItem key={i}>{s.time}
                <p><a href={s.tickets}>get tickets</a></p>
                </ListGroupItem>
            </ListGroup>
            )}
            </ul>
            </Card>
            </Col>
            )}
            </Row>
            </Container>
        )
    }
}

export default Movie;