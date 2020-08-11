use URI;
use Web::Scraper;
 
# First, create your scraper block
my $movie = scraper {
    # Parse all LIs with the class "status", store them into a resulting
    # array 'tweets'.  We embed another scraper for each movie's details.
    process "title_bar_wrapper", "movie_details[]" => scraper {
        # And, in that array, pull in the elementy with the class
        # "entry-content", "entry-date" and the link
        process ".title_wrapper > title_bar > h1", title => 'TEXT';
        process ".title_wrapper > h1 > span", link => '@href', when => 'TEXT'; 
    };
};
 
my $res = $movie->scrape( URI->new("https://www.imdb.com/title/tt1413492/?ref_=nv_sr_srsg_0") );
 
# The result has the populated details array
for my $movie (@{$res->{movie_details}}) {
    print "$movie->{title} $movie->{when} (link: $movie->{link})\n";
}

