<?php
header('Content-Type: application/json');

$feed_url = $_GET['rssUrl'];

function removeCdataTags($input) {
    return str_replace(["<![CDATA[", "]]>"], "", $input);
}
function fetchRSS($url) {
    $rss = simplexml_load_file($url);
    $items = [];
    
    foreach ($rss->entry as $entry) {
        $media_group = $entry->children('media', true)->group;
        $media_description = $media_group->description;
        $media_thumbnail = $media_group->thumbnail->attributes()['url'];
        $items[] = [
            'title' => (string) html_entity_decode(removeCdataTags($entry->title)),
            'link'  => (string) $entry->link['href'],
            'image' => (string) $media_thumbnail,
            'description' => (string) $media_description,
            'pubDate' => (string) $entry->published,
        ];
    }
    
    return $items;
}

echo json_encode(fetchRSS($feed_url));
