use Mojolicious::Lite;
get '/' => {text => 'Hello 🌍 World!'};
app->start;