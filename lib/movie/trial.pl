use URI;
use Web::Scraper;
use Encode;
use warnings;
use strict;
use Data::Dumper;
use diagnostics;
use LWP::Simple qw(get getstore); 
use JSON;
binmode STDOUT, ":utf8";
use utf8;

=pod
my $para = scraper {
        process 'div p', "para[]" => scraper {
        # get text inside "small" element
        process 'p', each_para => 'TEXT';
    };
};
 
my $res = $para->scrape( URI->new("http://qdnet.com/training/example.html") );
 
# iterate the array 'authors'
for my $author (@{$res->{para}}) {
    print Encode::encode("utf8", "$author->{each_para}\n");
}
=cut
my $file = "movies_1.json";
my $api = "https://imdb-api.com/en/API/SearchMovie/k_1FB31LF3/Inception%202010";
my $api_content = getstore($api,$file);

my $json;
{
  local $/; #Enable 'slurp' mode
  open my $fh, "<", "movies_1.json";
  $json = <$fh>;
  close $fh;
}

my $data = decode_json($json);
#print Dumper($data);
print $data->{'results'}->[0]->{'title'};