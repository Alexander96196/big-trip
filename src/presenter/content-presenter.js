import { render, RenderPosition } from '../framework/render.js';
import ListView from '../view/list-view.js';
import TripView from '../view/trip-view.js';
import SortView from '../view/sort-view.js';
import PointPresenter from './point-presenter.js';
import NoPointView from '../view/no-point-view.js';
import { updateItem } from '../utils/common.js';

export default class ContentPresenter {
  #listContainer = null;
  #pointsModel = null;

  #tripComponent = new TripView();
  #listComponent = new ListView();
  #sortComponent = new SortView();
  #noPointComponent = new NoPointView();

  #points = [];
  #destinations = [];
  #offers = [];

  #pointPresenters = new Map();

  constructor({ listContainer, pointsModel }) {
    this.#listContainer = listContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    const points = [...this.#pointsModel.getPoints()];
    const destinations = [...this.#pointsModel.getDestinations()];
    const offers = [...this.#pointsModel.getOffers()];

    this.#renderTrip();

    for (let i = 0; i < points.length; i++) {
      this.#renderPoint({point: points[i], destinations, offers});
    }
  }

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handlePointChange = (updatedPoint) => {
    this.#points = updateItem(this.#points, updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #renderSort() {
    render(this.#sortComponent, this.#tripComponent.element, RenderPosition.AFTERBEGIN);
  }

  #renderPoint = ({ point, destinations, offers }) => {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#listComponent.element,
      destinations,
      offers,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  };

  #renderPoints = () => {
    this.#points.forEach((point) => this.#renderPoint({
      point,
      destinations: this.#destinations.find((dstntn) => dstntn.id === point.destination),
      offers: this.#offers
    }));
  };

  #renderNoPoints = () => {
    render(this.#noPointComponent, this.#tripComponent.element, RenderPosition.AFTERBEGIN);
  };

  // #clearPoints = () => {
  //   this.#pointPresenters.forEach((presenter) => presenter.destroy());
  //   this.#pointPresenters.clear();
  // }

  #renderPointsList = () => {
    render(this.#listComponent, this.#tripComponent.element);
    this.#renderPoints();
  };

  #renderTrip() {
    render(this.#tripComponent, this.#listContainer);

    if (!this.#points) {
      this.#renderNoPoints();
      return;
    }

    this.#renderSort();
    this.#renderPointsList();
  }
}
