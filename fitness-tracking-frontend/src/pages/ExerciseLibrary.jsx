import { useMemo, useState } from 'react';
import { useExercises } from '../hooks/useExercises';
import { Input } from '../components/ui/Input';
import { exerciseImage, images, FALLBACK_IMAGE } from '../utils/images';
import { exerciseVideo, watchUrl } from '../utils/videos';

const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

const CATEGORIES = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full_body'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const ExerciseLibrary = () => {
  const { exercises, isLoading, error } = useExercises();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [active, setActive] = useState(null);

  const filteredExercises = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchesSearch = !q || ex.name.toLowerCase().includes(q) || ex.category.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'all' || ex.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || ex.difficultyLevel === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [exercises, search, categoryFilter, difficultyFilter]);

  if (isLoading && exercises.length === 0) {
    return <div className="text-center py-12 text-ink-400">Loading exercises…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-700">
        <img src={images.back} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-overlay" />
        <div className="relative p-8 sm:p-10">
          <span className="eyebrow">Move better</span>
          <h2 className="headline text-4xl sm:text-5xl mt-2">Exercise Library</h2>
          <p className="text-ink-300 mt-2 max-w-xl">
            Master the fundamentals. Filter by muscle group and difficulty.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search exercises…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="ink-input max-w-[180px]"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="ink-input max-w-[180px]"
        >
          <option value="all">All Levels</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Category quick chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={
            'px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ' +
            (categoryFilter === 'all'
              ? 'bg-volt-500 text-ink-950'
              : 'bg-ink-800 text-ink-300 hover:bg-ink-700')
          }
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoryFilter(c)}
            className={
              'px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ' +
              (categoryFilter === c
                ? 'bg-volt-500 text-ink-950'
                : 'bg-ink-800 text-ink-300 hover:bg-ink-700')
            }
          >
            {c.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filteredExercises.length === 0 ? (
        <div className="text-center py-16 text-ink-400 border border-dashed border-ink-700 rounded-xl">
          {exercises.length === 0
            ? 'No exercises in the library yet.'
            : 'No exercises match your filters.'}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <button
              key={exercise._id}
              type="button"
              onClick={() => setActive(exercise)}
              className="group relative h-64 w-full overflow-hidden rounded-xl border border-ink-700 text-left transition-transform hover:-translate-y-1 hover:shadow-glow"
            >
              <img
                src={exerciseImage(exercise)}
                alt={exercise.name}
                loading="lazy"
                onError={handleImgError}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-grad-overlay" />
              <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                <span className="chip chip-volt capitalize backdrop-blur">{exercise.category}</span>
                <span className="chip backdrop-blur capitalize">{exercise.difficultyLevel}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="headline text-2xl text-ink-100 leading-tight">{exercise.name}</h3>
                <p className="text-sm text-ink-300 mt-1 line-clamp-2">
                  {exercise.equipmentNeeded && exercise.equipmentNeeded.length > 0
                    ? `Equipment: ${exercise.equipmentNeeded.join(', ')}`
                    : 'No equipment required'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center z-40 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative bg-ink-900 border border-ink-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48">
              <img
                src={exerciseImage(active)}
                alt={active.name}
                onError={handleImgError}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-grad-overlay" />
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-ink-950/60 text-ink-100 hover:bg-volt-500 hover:text-ink-950 text-xl leading-none transition-colors"
              >
                ×
              </button>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="eyebrow">{active.difficultyLevel}</span>
                <h3 className="headline text-3xl mt-1">{active.name}</h3>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Sample form video */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow">Sample video</span>
                  <span className="text-[11px] uppercase tracking-widest2 text-ink-500">
                    Form tutorial
                  </span>
                </div>
                <div className="relative w-full overflow-hidden rounded-xl border border-ink-700 bg-ink-950 aspect-video">
                  <iframe
                    src={exerciseVideo(active)}
                    title={`${active.name} — form tutorial`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <a
                  href={watchUrl(exerciseVideo(active))}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-ink-400 hover:text-volt-500"
                >
                  Video not playing? Watch on YouTube ↗
                </a>
              </div>

              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-widest2 text-ink-400">Category</dt>
                  <dd className="capitalize text-ink-100 mt-1">{active.category}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest2 text-ink-400">Difficulty</dt>
                  <dd className="capitalize text-ink-100 mt-1">{active.difficultyLevel}</dd>
                </div>
                {active.muscleGroups?.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-widest2 text-ink-400">Muscle groups</dt>
                    <dd className="text-ink-100 mt-1">{active.muscleGroups.join(', ')}</dd>
                  </div>
                )}
                {active.equipmentNeeded?.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-widest2 text-ink-400">Equipment</dt>
                    <dd className="text-ink-100 mt-1">{active.equipmentNeeded.join(', ')}</dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-widest2 text-ink-400">Instructions</dt>
                  <dd className="whitespace-pre-line text-ink-200 mt-1">{active.instructions}</dd>
                </div>
                {active.videoUrl && (
                  <div className="sm:col-span-2">
                    <a className="btn-volt inline-flex" href={active.videoUrl} target="_blank" rel="noreferrer">
                      ▶ Watch video
                    </a>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
