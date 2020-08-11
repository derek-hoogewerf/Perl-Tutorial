use IMBD::Film;
use warnings;


sub cleanTitle{
 my ($dirtyTitle, $blacklist) = @_;
 my @cleanTitleArray;

 # HEURISTIC #1: everything which is not alphanumeric is a separator;
 # HEURISTIC #2: if an extracted word belongs to the blacklist then ignore it;
 while ($dirtyTitle =~ /([a-zA-Z0-9]+)/g){
 my $word = lc($1);    # blacklist is lowercase
 if (!defined $$blacklist{$word}){
 push @cleanTitleArray, $word;
 }
 }

 # HEURISTIC #3: often movies have a date (year) after the title, remove
 # that (if it is not the title of the movie itself!);
 my $lastWord = pop(@cleanTitleArray);
 my $arraySize = @cleanTitleArray;
 if ($lastWord !~ /(19\d\d)|(20\d\d)/ || !$arraySize){
 push @cleanTitleArray, $lastWord;
 }

 return join (" ", @cleanTitleArray);
}

sub getAlternativeTitle{
 my $imdb = shift;
 my $altTitle = "";
 my $aka = $imdb->also_known_as();
 foreach $key (keys %$aka){
 # NOTE: currently the default is to return the Italian title,
 # otherwise rollback to the first occurrence of International
 # or English. Change below here if you want to customize it!
 if ($key =~ /^Ital/){
 $altTitle = $$aka{$key};
 last;
 }elsif ($key =~ /^(International|English)/){
 $altTitle = $$aka{$key};
 }
 }
 return $altTitle;
}