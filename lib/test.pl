  #!/usr/bin/env perl
    use strict;
    use warnings;
    # use re 'debug';
    
    my $str = 'aacbbbcac';
    
    if ($str =~ m/((a+)?(b+)?(c))*/) {
       print "$1 | $2 | $3 | $4\n";
    }
