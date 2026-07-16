"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, CreatePostFormData } from "@/lib/validations/post";
import { createPost } from "@/lib/api/posts";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreatePostPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      links: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - selectedFiles.length);
    const validFiles = newFiles.filter((f) =>
      ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"].includes(f.type)
    );

    if (validFiles.length !== newFiles.length) {
      toast.error("Some files were skipped — only images (JPEG, PNG, GIF, WebP) are allowed.");
    }

    const updatedFiles = [...selectedFiles, ...validFiles].slice(0, 5);
    setSelectedFiles(updatedFiles);

    // Generate previews
    const newPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const onSubmit = async (data: CreatePostFormData) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.subtitle) formData.append("subtitle", data.subtitle);
      formData.append("description", data.description);

      // Filter out empty links and send as JSON string
      const validLinks = (data.links || [])
        .map((l) => l.value)
        .filter((v) => v && v.trim() !== "");
      if (validLinks.length > 0) {
        formData.append("links", JSON.stringify(validLinks));
      }

      // Append image files
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await createPost(formData);
      toast.success("Post created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-form-page">
      <div className="post-form-container">
        <div className="post-form-header">
          <h1 className="text-headline-md">Create a Post</h1>
          <p className="post-form-header__subtitle">
            Share your trail experience with the community
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="post-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="post-title">
              Title <span className="post-form__required">*</span>
            </label>
            <input
              id="post-title"
              type="text"
              placeholder="Give your post a title..."
              className={`post-form__input ${errors.title ? "post-form__input--error" : ""}`}
              {...register("title")}
            />
            {errors.title && (
              <span className="form-field-error">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Subtitle */}
          <div className="form-group">
            <label className="form-label" htmlFor="post-subtitle">
              Subtitle
            </label>
            <input
              id="post-subtitle"
              type="text"
              placeholder="Optional subtitle or tagline..."
              className="post-form__input"
              {...register("subtitle")}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="post-description">
              Description <span className="post-form__required">*</span>
            </label>
            <textarea
              id="post-description"
              placeholder="Tell your story... Describe the trail, the experience, tips for others..."
              rows={6}
              className={`post-form__textarea ${errors.description ? "post-form__input--error" : ""}`}
              {...register("description")}
            />
            {errors.description && (
              <span className="form-field-error">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                {errors.description.message}
              </span>
            )}
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">
              Images
              <span className="post-form__hint"> (up to 5 images, max 5MB each)</span>
            </label>
            <div
              className={`post-form__dropzone ${dragActive ? "post-form__dropzone--active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 40, color: "var(--color-outline)" }}
              >
                add_photo_alternate
              </span>
              <p className="post-form__dropzone-text">
                Drag & drop images here, or <span>click to browse</span>
              </p>
              <p className="post-form__dropzone-hint">JPEG, PNG, GIF, WebP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="post-form__previews">
                {previews.map((src, i) => (
                  <div key={i} className="post-form__preview-item">
                    <img src={src} alt={`Preview ${i + 1}`} />
                    <button
                      type="button"
                      className="post-form__preview-remove"
                      onClick={() => removeImage(i)}
                      aria-label={`Remove image ${i + 1}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        close
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="form-group">
            <label className="form-label">External Links</label>
            {fields.map((field, index) => (
              <div key={field.id} className="post-form__link-row">
                <input
                  type="url"
                  placeholder="https://example.com"
                  className={`post-form__input ${
                    errors.links?.[index]?.value ? "post-form__input--error" : ""
                  }`}
                  {...register(`links.${index}.value`)}
                />
                <button
                  type="button"
                  className="post-form__link-remove"
                  onClick={() => remove(index)}
                  aria-label="Remove link"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    delete
                  </span>
                </button>
              </div>
            ))}
            <button
              type="button"
              className="post-form__add-link"
              onClick={() => append({ value: "" })}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
              Add Link
            </button>
          </div>

          {/* Map Placeholder */}
          <div className="form-group">
            <label className="form-label">Map Integration Data</label>
            <div className="post-form__map-placeholder">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 36, color: "var(--color-outline)" }}
              >
                map
              </span>
              <div>
                <p className="post-form__map-placeholder-title">Coming Soon</p>
                <p className="post-form__map-placeholder-desc">
                  Trail GPS tracking, route mapping, and elevation data will be available here in a future update.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="post-form__submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20, animation: "spin 1s linear infinite" }}
                >
                  progress_activity
                </span>
                Publishing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  send
                </span>
                Publish Post
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
