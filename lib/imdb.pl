use IMDB::Film;
use Data::Dumper;
use warnings;
 
# Retrieve a movie information by its IMDB code
#my $imdbObj = new IMDB::Film(crit => 227445);
# Retrieve a movie information by its title

my $imdbObj = new IMDB::Film(crit => 'The Avengers');
 
if($imdbObj->status) {
        print "Title: ".$imdbObj->title()."\n";
        print "Year: ".$imdbObj->year()."\n";
        my @directors = @{print "Director: ".Dumper($imdbObj->directors())};
        my @genres = @{print "Genre: ".Dumper($imdbObj->genres())};
        my @cast = @{print "Cast: ".Dumper($imdbObj->cast())};
        #my($rating, $vnum, $avards) = $imdbObj->rating();
        #print "RATING: $rating ($vnum votes)";   
        print "Plot Symmary: ".$imdbObj->plot()."\n";
} else {
        print "Something wrong: ".$imdbObj->error;
}

#