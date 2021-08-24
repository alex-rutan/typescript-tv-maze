import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

const API_BASE_URL =  "https://api.tvmaze.com/"


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

interface Show {
  id: number;
  name: string;
  summary: string;
  image: {medium: string};
}

interface Episode {
  id: number;
  name: string;
  season: number;
  number: number;
}

async function getShowsByTerm(term: string): Promise<Show[]> {
  const res = await axios.get(`${API_BASE_URL}search/shows?q=${term}`);
  console.log(res.data);
  return res.data.map( (result:{show:Show}):any => ({
    id: result.show.id,
    name: result.show.name,
    summary: result.show.summary,
    image: result.show.image ? result.show.image.medium : "https://i.redd.it/km17n5skrid11.jpg"
  }))
}



/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Show[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term :string = $("#searchForm-term").val() as string;
  const shows :Show[] = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) :Promise<void> {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<Episode[]> {
  const res = await axios.get(`${API_BASE_URL}shows/${id}/episodes`);
  console.log(res.data);
  return res.data.map((result: Episode ):Episode => ({
    id: result.id,
    name: result.name,
    season: result.season,
    number: result.number
  }));
}



/** Given list of episodes, create markup for each and to DOM  */

function populateEpisodes(episodes: Episode[]) {
  $episodesList.empty();
  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name} (season ${episode.season} number ${episode.number})</li>`
    )
    $episodesList.append($episode);
  }
  $episodesArea.show();
}

/** Handle episode button click: get episodes from API and display.
 */

 async function searchForEpisodesAndDisplay(evt:JQuery.ClickEvent) {
  const id :number = Number($(evt.target).parent().parent().parent().data("show-id"));
  const episodes :Episode[] = await getEpisodesOfShow(id);

  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", searchForEpisodesAndDisplay);